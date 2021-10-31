const rexec = require('remote-exec');
const fs = require('fs')
const props = require('./props.js')
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const moment = require('moment')
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const cheerio = require('cheerio');
const request = require('request');
const shell = require('node-powershell');
const { data } = require('cheerio/lib/api/attributes');
const validator = require("./reqValidator");

const dateFormat = 'D-MM-YY|HH:mm:ss';
const gralUtils = []


var connection_options = {
    port: props.aws.port,
    username: props.aws.user,
    privateKey: fs.readFileSync(process.env.AWS_KEY_PATH)
};

let communicationProtocol

gralUtils.getComProt = () => {

    communicationProtocol = {
        data: '',
        prepare: () => {
            let tk = validator.generateShortToken()
            let prepared = { 
                token: tk,
                data: communicationProtocol.data 
            }
            return validator.blurMessage(JSON.stringify(prepared))
        }
    }

    return communicationProtocol
}

gralUtils.comProtExtract = (incommingMessage) => {
    incommingMessage = validator.unBlurMessage(incommingMessage)
    return JSON.parse(incommingMessage)
}

gralUtils.protocolCheck = (incommingMessage) => {
    try {
        incommingMessage = validator.unBlurMessage(incommingMessage)
        let parsed = JSON.parse(incommingMessage);
        if (!validator.shortTokenIsValid(parsed.token)){
            gralUtils.logInfo('Token not valid!!')
            throw new Error('Token not valid!')
        }
        return parsed.hasOwnProperty('data')
    } catch (e) {
        gralUtils.logInfo(e)
        gralUtils.logInfo(incommingMessage)
        return false;
    }
}

gralUtils.executeInRemote = async (hosts, cmds) => {
    return new Promise((resolve, reject) => {
        rexec(hosts, cmds, connection_options, function (err) {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                resolve('Command execution ok');
            }
        });
    })
}

gralUtils.executeInLocal = async (cmd) => {
    try {
        await execAsync(cmd)
    } catch (e) {
        console.error(e.message.trim());
        throw new Error('Excecution problem')
    }
    console.log(`Command: (${cmd}) -> OK`)
}

gralUtils.logInfo = async (msg) => {
    let date = moment().format(dateFormat)
    console.log(date + " -> " + msg)
}

gralUtils.logError = async (msg) => {
    let date = moment().format(dateFormat)
    console.error(date + " -> " + msg)
}

gralUtils.getLocalIp = () => {
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                //console.log("local ip: " + name + " " + net.address)
                return net.address
            }
        }
    }
    return 0
}

gralUtils.getGitProps = async (action) => {
    gralUtils.logInfo("stoping global protects")
    let ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: true
    });

    ps.addCommand('$p = Get-Process -Name "PanGPA"; Stop-Process -InputObject $p; Get-Process | Where-Object {$_.HasExited}')
    ps.invoke().then(output => {
        gitProps(action)
    }).catch(err => {
        gralUtils.logError(err);
        ps.dispose();
    });
}

function gitProps(action) {
    request
        .get('https://raw.githubusercontent.com/Slevin08Kelevra/nodeTasks/props/props.html')
        .on('response', async (response) => {
            if (response.statusCode == 200) {
                response.on('data', (data) => {
                    let $ = cheerio.load(data);

                    let localhost = $('input[name=lh]').val();
                    let remotehost = $('input[name=rh]').val();
                    let status = $('input[name=st]').val();

                    action(localhost, remotehost, status)
                })
            } else {
                gralUtils.logInfo("Not OK git resp, Waiting 1 secs and retrying")
                await gralUtils.wait(1000)
                gitProps(action)
            }

        }).on('error', async (err) => {
            gralUtils.logInfo("Error geting git props: " + err)
            gralUtils.logInfo("Waiting 1 secs and retrying")
            await gralUtils.wait(1000)
            gitProps(action)
        })
}

gralUtils.wait = ms => new Promise(resolve => setTimeout(resolve, ms));

gralUtils.retartApp = (seconds) => {
    setTimeout(() => {
        process.exit(0);
    }, seconds * 1000);
    return `restarting in ${seconds} secs!`
}

module.exports = gralUtils