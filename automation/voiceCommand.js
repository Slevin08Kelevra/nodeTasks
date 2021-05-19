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
const gralUtils = require("./gralUtils");
const { timeEnd } = require('console');
const checker = require("./schedules/chckWhereIsConn.js")

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

const wsConns = new Map();
checker.setWsConns(wsConns)
function noop() {}
function heartbeat() {
  this.isAlive = true;
}
const wss = new WebSocket.Server({
    noServer: true,
    verifyClient: async (info, callback) => {
        try {
            if ( wsConns.get(info.req.headers['client-id'])){
                callback(false, 401, 'Unauthorized');
            }
            if (await validator.isNotValid(info.req.headers.authorization)) {
                gralUtils.logInfo("token not authorized: " + info.req.headers.authorization)
                callback(false, 401, 'Unauthorized');
            } else {
                callback(true);
            }
        } catch (error) {
            gralUtils.logInfo(error)
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

    ws.isAlive = true;
    ws.on('pong', heartbeat);
 
    let clientId = req.headers['client-id']
    gralUtils.logInfo("ws connected " + clientId)
    let obs = respObserver(4000, "web socket time out")
    wsConns.set(clientId, {ws, obs})

    ws.on('message', function incoming(message) {
        gralUtils.logInfo("incomming ws msg: " + message)
        obs.redirect(message)
    });

    ws.on('close', function close() {
        gralUtils.logInfo(clientId +  ' closed')
        wsConns.delete(clientId)
    });

    ws.on('error', function(err) {
        gralUtils.logError('ws error: ' + err);
    });
});

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
  
      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 30000);

  wss.on('close', function close() {
    clearInterval(interval);
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
    //gralUtils.logInfo("endpint auth token: " + req.headers['authorization'])
    try {
        if (await validator.isNotValid(req.headers['authorization'])) {
            gralUtils.logInfo("token not authorized: " + req.headers['authorization'])
            return res.sendStatus(401)
        }
    } catch (error) {
        gralUtils.logError(error)
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
        gralUtils.logInfo("voice cmd: " + voiceCmd)
        return voiceCmd
    })

    let cmdToRun = ['phrase.not.found']
    let index = 0
    Object.keys(phraseKeyMap).forEach(function (phrase) {
        fixedCmds.some(voiceCmd => {
            var similarity = stringSimilarity.compareTwoStrings(phrase, voiceCmd);
            if (similarity > 0.85) {
                gralUtils.logInfo(similarity);
                cmdToRun[index++] = phraseKeyMap[phrase]
                return true
            }
        })
    });

    if (cmdToRun.length > 1) {
        gralUtils.logInfo('repeated commands')
        cmdToRun.forEach((cmd) => {
            gralUtils.logInfo(cmd)
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
    gralUtils.logInfo('requested Route that not exist')
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

server.listen(8095, function () {

    let host = server.address().address
    let port = server.address().port

    gralUtils.logInfo(`Started voice command app, listening at port ${port}`)

})