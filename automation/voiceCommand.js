const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const express = require('express');
const app = express();
const commands = require('./commands/main.js');
const phraseKeyMap = commands.phraseKeyMap
const { ToWords } = require('to-words');
const stringSimilarity = require("string-similarity");
const validator = require("./reqValidator");
const { timeEnd } = require('console');

var privateKey = fs.readFileSync(__dirname + '/certs/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/server.crt', 'utf8');
var clientCert = [fs.readFileSync(__dirname + '/certs/client-ca-crt.pem', 'utf8')]
var options = {
    key: privateKey,
    cert: certificate,
    ca: clientCert,
    requestCert: true
};
var server = https.createServer(options, app)

const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: async (info, callback) => {
        try {
            if (await validator.isNotValid(info.req.headers.authorization)) {
                console.log("token not authorized: " + info.req.headers.authorization)
                callback(false, 401, 'Unauthorized');
            } else {
                callback(true);
            }
        } catch (error) {
            console.log(error)
            callback(false, 404, 'Not Found');
        }
    }

});
server.on('upgrade', function upgrade(request, socket, head) {
    //const pathname = url.parse(request.url).pathname;
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
})

const wsConns = new Map();
const respObserver = (timeout, errMessage) => {
    return {
        res: null, 
        redirect: (message) => {
           res(message)
        },
        expect: async () => {
            let timeOutProm =  new Promise((resolve, reject) => {
                setTimeout( () => { reject(errMessage); }, timeout);
            })
            let messageProm = new Promise((resolve, reject) => {
                res = resolve
            })
            return Promise.race([ 
                messageProm, 
                timeOutProm, 
              ])
        }
    }
}
wss.on('connection', function connection(ws, req) {

    console.log("ws connected")
    let clientId = req.headers['client-id']
    let obs = respObserver(4000, "web socket time out")
    wsConns.set(clientId, {ws, obs})

    ws.on('message', function incoming(message) {
        console.log(message)
        obs.redirect(message)
    });

    ws.on('close', function close() {
        console.log(clientId +  ' closed')
        wsConns.delete(clientId)
    });

    ws.on('error', function(err) {
        console.error('ws error: ' + err);
    });
});

const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: false,
        ignoreDecimal: true,
        ignoreZeroCurrency: true,
    }
});

//app.use(express.urlencoded())
app.use(express.json());

var validate = async (req, res, next) => {
    console.log(req.headers['authorization'])
    try {
        if (await validator.isNotValid(req.headers['authorization'])) {
            console.log("token not authorized: " + req.headers['authorization'])
            return res.sendStatus(401)
        }
    } catch (error) {
        console.log(error)
        return res.sendStatus(404)
    }
    next();
}
app.use(validate)

var execEnabled = true

let postHanler = async (req) => {
    let possibleCmds = req.body.possibleMessages
    let fixedCmds = possibleCmds.map((cmd) => {
        let voiceCmd = cmd.toLowerCase()
        voiceCmd = voiceCmd.replace(/([0-9]+)/g, (number) => {
            return toWords.convert(Number(number))
        })
        console.log(voiceCmd)
        return voiceCmd
    })

    let cmdToRun = ['phrase.not.found']
    let index = 0
    Object.keys(phraseKeyMap).forEach(function (phrase) {
        fixedCmds.some(voiceCmd => {
            var similarity = stringSimilarity.compareTwoStrings(phrase, voiceCmd);
            if (similarity > 0.85) {
                console.log(similarity);
                cmdToRun[index++] = phraseKeyMap[phrase]
                return true
            }
        })
    });

    if (cmdToRun.length > 1) {
        console.log('repeated commands')
        cmdToRun.forEach((cmd) => {
            console.log(cmd)
        })
        cmdToRun = ['general.phrase.repeated']
    }

    let response = {}
    if (execEnabled) {
        execEnabled = false
        response.status = await(commands[cmdToRun[0]] || commands['general.phrase.not.found'])(wsConns)
        delayAndEnableExec()
        if (cmdToRun[0]) {
            response.appliedCmd = cmdToRun[0].replace(/\./g, ' ')
        } else {
            response.appliedCmd = 'General phrase not found'
        }
    } else {
        response.status = "repeated, repetition not allowed"
    }

    return response
}

app.post('/send', async (req, res, next) => {

    let response
    response = await postHanler(req)
    res.json(response)
    
})

app.use(function(req, res, next) {
    console.log('Route does not exist')
    res.status(404).send({
        status: 404,
        message: 'you have nothing to do here! you will be banned',
        type: 'just4idiots'
    })
 })

async function delayAndEnableExec() {
    setTimeout(function () {
        execEnabled = true
    }, 5000);
};

async function test() {
    console.log("async called")
}

server.listen(8095, function () {

    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})