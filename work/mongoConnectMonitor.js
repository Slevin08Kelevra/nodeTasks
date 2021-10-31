var suppose = require('suppose')
    , fs = require('fs')
    , assert = require('assert')
var propertiesReader = require('properties-reader');
var tcpPortUsed = require('tcp-port-used');
const https = require('https');
const { get } = require('http');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
var shellParser = require('node-shell-parser');
const { fork, spawn } = require('child_process');
const options = {
    shell: false,
    slient: true,
    detached: true,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
};
const cron = require('node-cron');
const moment = require('moment')
const express = require("express");
const app = express();
const dateFormat = 'D-MM-YYYY-HH:mm:ss';
const Stream = require('stream')
const TokenGenerator = require('uuid-token-generator');
const tokgen = new TokenGenerator();
const log = require('node-log-rotate');
const validator = require('./../automation/reqValidator');

log.setup({
  appName: 'mongoConnectMonitor',
  maxSize: 2 * 1024 * 1024
});

app.listen(8585, () => {
    logNow("Server running on port 8585");
});

var properties = propertiesReader('automation.props');
var mongoBinPath = properties.get('mongo.bin.path')
var params = properties.get('mongo.dump.parameters')
var backUpPath = properties.get('mongo.backup.path')
var localBackUpPath = properties.get('mongo.local.backup.path')
var rotNum = properties.get('mongo.rotate.number')
var forwardedPort = properties.get('mongo.remote.forward.port')
var devUser = properties.get('mongo.develop.user')
var devPass = properties.get('mongo.develop.pass')
//var rotated = parse(backUpPath, 1)
var localRotated = parse(localBackUpPath, 1)
//var injectedParams = parse(params, rotated, forwardedPort, devUser, devPass)
//var splitedParams = injectedParams.split(" ");
var restoreParams = properties.get('mongo.restore.params')
//var injectedRestoreParams = parse(restoreParams, null)
//var spitedRestoreParams = injectedRestoreParams.split(" ")
var ocPArams = properties.get('oc.connect.params')
var splitedOcParams = ocPArams.split(" ")
var ocBinPath = properties.get('oc.bin.path')
var listPodsCommand = properties.get('oc.list.pods.command')
var filterPodRegex = new RegExp(properties.get('oc.filter.pod.regex'));
var filterPodStatus = properties.get('oc.filter.pod.status')
let {user, clau} = validator.getUserClau();
var ocUsername = user
var ocPassword = clau
var ocForwardPortConf = properties.get('oc.forward.port.conf')
var ocVpnTestUrl = properties.get('oc.vpn.url.test')
var dumpMadeDay = moment().subtract(3, 'day')
var token = ""

cron.schedule('*/30 * 7-23 * * *', () => {
    //logNow('Starting shedule')
    testVPN();
});

cron.schedule('0 * * * *', () => {
    logNow('Rotating logs if necessary')
    log.deleteLog(2)
});


// terminar las actions

const response = {
    token: '',
    possibleActions: "?action=((remote|local)-dump|(remote|local)-restore-[file id]|remoteDumpRestore)",
    actionMade: 'none',
    status: {
        oc: 'unknown',
        vpn: 'unknown',
        port_forwarding: 'unknown'
    },
    dumps: []
};
app.get("/mongoForwardStatus", (req, res, next) => {
    logNow("Entering mongo forward status api")
    let reqToken = req.header('Action-Token')
    let actionGranted = false
    let action = req.query.action
    action = (action) ? action : ""
    if (action && token !== reqToken) {
        response.actionMade = "token required for " + action
    } else {
        let restore = action.match(/(?<env>remote|local)-restore-(?<fileId>[0-9]{1,2})/)
        let dump = action.match(/(?<env>remote|local)-dump/)
        let dumpRestore = action.match(/remoteDumpRestore/)
        if (!restore && !dump && !dumpRestore && action != "") {
            response.actionMade = "Action not recognized"
        } else {
            let actionMade = "Action not recognized"
            if (restore) {
                if (restore.groups.env === "remote"){   
                    file = parse(backUpPath, restore.groups.fileId)                
                    makeRestore(file)
                    actionMade = "restoring from remote dev backup: " + file
                } else if (restore.groups.env === "local"){
                    actionMade = "restore local not imp"
                }
            } else if (dump) {
                if (dump.groups.env === "remote"){                   
                    prepareDump(backUpPath)
                    actionMade = "Dumping remote dev"
                } else if (dump.groups.env === "local"){
                    actionMade = "dump local not imp"
                }
            }  else if (dumpRestore) {
                actionMade = "Dumping remote dev and restoring, not imp"
            }
            response.actionMade = actionMade
        }
    }

    response.dumps = []
    for (i = 1; i <= rotNum; i++) {
        let file = parse(backUpPath, i)
        if (fs.existsSync(file)) {
            let fileDetails = fs.statSync(file)
            let date = moment(fileDetails.mtime).format(dateFormat)
            let dumpInfo =  `id: ${i}, file: ${file}, date: ${date}`
            response.dumps.push(dumpInfo)
        }
    }

    token = tokgen.generate()
    response.token = token
    res.json(response);
});

function logNow(message) {
    //console.log(moment().format(dateFormat) + " - " + message)
    log.log(message);
}

function prepareDump(path) {
    var index = 0
    let rotated = parse(path, 1)
    if (rotNum < 2) rotNum = 2
    do {
        index++
        rotated = parse(path, index)
    } while (fs.existsSync(rotated) && index <= rotNum);
    if (index > rotNum) {
        index = rotNum
        rotated = parse(path, index)
        fs.unlinkSync(parse(path, 1))
        for (i = 1; i <= rotNum - 1; i++) {
            var next = i + 1
            fs.renameSync(parse(path, next), parse(path, i))
        }
    }

    let injectedParams = parse(params, rotated, forwardedPort, devUser, devPass)
    let splited = injectedParams.split(" ");
    makeDump(splited)
}

function checkIfDumpIsNeeded() {
    logNow('Checking if dump is required:')
    var found = false
    for (i = rotNum; i >= 1; i--) {
        var file = parse(backUpPath, i)
        if (fs.existsSync(parse(backUpPath, i))) {
            var stats = fs.statSync(file)
            if (moment(stats.ctime).isSame(Date.now(), 'day')) {
                dumpMadeDay = moment()
                logNow('Dump not required!')
                found = true
                break;
            }
        }
    }
    if (!found) {
        logNow('Dump is required!')
        prepareDump(backUpPath)
    }
}

function testForwardPort() {
    tcpPortUsed.check(forwardedPort, '127.0.0.1')
        .then(function (inUse) {
            logNow('Port 27018 usage: ' + inUse);
            if (!inUse) {
                response.status.port_forwarding = 'disconnected'
                changeProjectOrTest()
            } else {
                response.status.port_forwarding = 'connected'
                response.status.oc = 'connected'
                if (!dumpMadeDay.isSame(Date.now(), 'day')) {
                    checkIfDumpIsNeeded()
                }
            }
        }, function (err) {
            logNow('Error on check:', err.message);
        });
}

async function forwardPort(podName) {
    process.chdir(ocBinPath);
    child = spawn('oc', ['port-forward', podName, ocForwardPortConf], options);
    child.stdout.on('data', (data) => {
        //logNow(process.pid);
        var str;
        str = data.toString().trim();
        logNow(`stdout: ${str}`);
        response.status.port_forwarding = 'connected'
    });
    child.stderr.on('data', (data) => {
        var str;
        str = data.toString().trim();
        logNow(`stderr: ${str}`);
    });
}

async function logOut() {
    process.chdir(ocBinPath);
    child = spawn('oc', ['logout'], options);
    child.on('error', function (err) {
        logNow('Error on logout: ' + err);
    });
    child.stdout.on('data', (data) => {
        logNow(data)
    });
    child.stderr.on('data', (data) => {
        logNow(`Error on logout: ${data}`);
    });
}

async function changeProjectOrTest() {
    if (response.status.oc == 'connecting') {
        return
    }
    process.chdir(ocBinPath);
    child = spawn('oc', ['project', 'edpp-dev'], options);
    child.on('error', function (err) {
        logNow('Error changing project: ' + err);
    });
    child.stdout.on('data', (data) => {
        logNow('OC CONNECTED AND CHANGED PROJECT')
        response.status.oc = 'connected'
        getMongoPod()
    });
    child.stderr.on('data', (data) => {
        logNow(`Error changing project or checking oc connection: ${data}`);
        connectOC()
    });
}

async function getMongoPod() {
    process.chdir(ocBinPath);
    const { stdout, stderr } = await exec(listPodsCommand);
    if (stderr != "") {
        logNow("Errorr getting pods: " + stderr.trim())
    } else {
        let podsTable = shellParser(stdout.trim())
        let result = podsTable.filter(pod => pod.STATUS == filterPodStatus && filterPodRegex.test(pod.NAME))
        if (result.length > 0) {
            logNow("pod to do the forward: " + result[0].NAME)
            forwardPort(result[0].NAME)
        }
    }
}

function connectOC() {
    if (response.status.oc == 'connecting') {
        return
    }
    response.status.oc = 'connecting'
    process.chdir(ocBinPath);
    logNow('Loggin to OC!')
    let ocConnectOutput
    const writableStream = new Stream.Writable()
    writableStream._write = (chunk, encoding, next) => {
        ocConnectOutput += chunk.toString()
        next()
    }
    suppose('oc', splitedOcParams,
        { debug: writableStream })
        .when('Username: ').respond(ocUsername + '\n')
        .when('Password: ').respond(ocPassword + '\n')
        .on('error', function (err) {
            logNow(err.message);
        })
        .end(function (code) {//Login successful.
            if (ocConnectOutput.search(/Login successful/) != -1) {
                logNow("OC CONNECTED")
                response.status.oc = 'connected'
                changeProjectOrTest()
            } else {
                logNow('Coudnot connect to OC:');
                logNow(ocConnectOutput)
            }
        })
}

function testVPN() {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    https.get(ocVpnTestUrl, (resp) => {
        var data = [];

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data.push(chunk);
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            var buffer = Buffer.concat(data).toString('base64');
            if (buffer) {
                logNow("VPN CONNECTED")
                response.status.vpn = 'connected'
                testForwardPort()
            } else {
                //logNow("VPN is not connected we wait until next iteration ")
                response.status.vpn = 'disconnected'
                response.status.oc = 'disconnected'
                response.status.port_forwarding = 'disconnected'
            }
        });

    }).on("error", (err) => {
        logNow("testVPN error: " + err.message);
    });

}

function makeDump(params) {
    process.chdir(mongoBinPath);
    let dumpOutput
    const writableStream = new Stream.Writable()
    writableStream._write = (chunk, encoding, next) => {
        dumpOutput += chunk.toString()
        next()
    }
    suppose('mongodump', params,
        { debug: writableStream })

        .on('error', function (err) {
            logNow(err.message);
        })
        .end(function (code) {
            //logNow(dumpOutput)
            logNow("params= " + params)
            logNow("DUMP OK")
            dumpMadeDay = moment()
        })
}

function makeRestore(file) {
    process.chdir(mongoBinPath);
    let injectedRestoreParams = parse(restoreParams, file)
    let spitedRestoreParams = injectedRestoreParams.split(" ")
    let restoreOutput
    const writableStream = new Stream.Writable()
    writableStream._write = (chunk, encoding, next) => {
        restoreOutput += chunk.toString()
        next()
    }
    suppose('mongorestore', spitedRestoreParams,
        { debug: writableStream })

        .on('error', function (err) {
            logNow(err.message.trim());
        })
        .end(function (code) {
            //logNow(restoreOutput)
            logNow("RESTORE OK")
        })
}


function parse(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;
    return str.replace(/%s/g, () => args[i++]);
}