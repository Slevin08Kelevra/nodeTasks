const WebSocket = require('ws');
const fs = require('fs');
const validator = require("./reqValidator")
const shell = require('node-powershell');
const ks = require('node-key-sender');
const SerialPort = require('serialport')
const { exec } = require('child_process');
const gralUtils = require('./gralUtils')

var privateKey = fs.readFileSync(__dirname + '/certs/client-key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/client-crt.pem', 'utf8');

const wsClient = []
var stopping = false;
var failedConnectionsTries = 0

function noop() { }
function heartbeat() {
  clearTimeout(this.pingTimeout);
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

var currentConnStatus
var tryedIp
var lastUsedIp
var wss
wsClient.start = (ip, st) => {
  currentConnStatus = st
  tryedIp = ip
  gralUtils.logInfo('connecting ws to ' + ip)
  wss = new WebSocket(`wss://${ip}:8095`, {
    protocolVersion: 8,
    origin: `wss://${ip}:8095`,
    rejectUnauthorized: false,
    key: privateKey,
    cert: certificate,
    headers: { "authorization": validator.generateToken(), "client-id": process.env.COMPUTER_NAME }
  });

  wss.on('open', function () {
    failedConnectionsTries = 0
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.terminate();
    }, 30000 + 1000);
    lastUsedIp = tryedIp
    gralUtils.logInfo('socket client open');
  });

  wss.on('ping', heartbeat);

  wss.on('close', async function () {
    clearTimeout(this.pingTimeout);
    let useIp = (lastUsedIp) ? lastUsedIp : tryedIp
    gralUtils.logInfo(`ws connection to ${useIp} closed`);
    if (!stopping) {
      await sleep(10000)
      wsClient.start(useIp, currentConnStatus)
    } else {
      stopping = false;
    }
  });

  wss.on('error', function (error) {
    if (failedConnectionsTries > 15) {
      restart()
    }
    failedConnectionsTries++
    gralUtils.logError("Socket client error: " + error.message)
  });

  wss.on('message', function incoming(action) {

    if (action.startsWith('connect2home:')) {
      let ipAndstatus = action.replace("connect2home:", "").split(':')
      gralUtils.logInfo("Trying to desconnect ws from aws and connect home")
      wsClient.stop()
      setTimeout(() => {
        wsClient.start(ipAndstatus[0], ipAndstatus[1])
      }, 10000);
    }

    switch (action) {
      case "showMyInf":
        showMyInf()
        break;
      case "showMyInf2":
        showMyInf2()
        break;
      case "unlock":
        unlock()
        break;
      case "ws-restart":
        wsClient.stop()
        evalueteStatuses()
        wss.send("BI comp ws restarting in 60 seconds!")
        break;
      case "ruok":
        wss.send("Ubuntu is fine, Sir!(vc-vib:2)")
        break;
      case "rualive":
        wss.send("Bi comp is fine, Sir!(vc-vib:2)")
        break;
      case "restart-app":

        restart()
        wss.send("Restarting in 3 secs!")

        break;
      default:
        text = "Action not recognized!";
    }

    gralUtils.logInfo("Exec action: " + action);
  });

}

function restart() {
  setTimeout(() => {
    const time = new Date();
    const filename = "restart.do"

    try {
      fs.utimesSync(filename, time, time);
    } catch (err) {
      fs.closeSync(fs.openSync(filename, 'w'));
    }
  }, 3000);
}

wsClient.stop = () => {
  lastUsedIp = null
  if (wss) {
    stopping = true
    wss.close()
  }
}

wsClient.send = (message) => {
  if (wss) {
    wss.send(message)
  }
}

wsClient.isConnected = () => {

  return wss && wss.readyState === WebSocket.OPEN
}

function unlock() {
  exec('node unlock.js Alvaro01Costarica', (err, stdout, stderr) => {
    if (err) {
      gralUtils.logError(err);
      return;
    }
    wss.send(stdout)
  });
}

function showMyInf() {
  let ps = new shell({
    executionPolicy: 'Bypass',
    noProfile: true
  });

  ps.addCommand('Get-Content C:\\Users\\paparini\\Documents\\myinfo.txt | Set-Clipboard')
  ps.invoke().then(output => {
    ks.sendCombination(['control', 'v']);
    wss.send("key sent!!!")
  }).catch(err => {
    gralUtils.logError(err);
    ps.dispose();
  });
}

function showMyInf2() {

  fs.readFile('C:\\Users\\paparini\\Documents\\myinfo.txt', 'utf8', (err, data) => {
    if (err) {
      gralUtils.logError(err)
      return
    }
    wss.send(data)
  })
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// TO DO: check 10 times or so and go back to wifi or find a way to check the current status is ok
function evalueteStatuses() {
  gralUtils.logInfo("evaluating statuses git page not changed")
  setTimeout(() => {
    gralUtils.getGitProps((localhost, remotehost, status) => {
      if (status != currentConnStatus) {
        let host = (status == "wifi") ? localhost : remotehost
        wsClient.start(host, status)
      } else {
        evalueteStatuses()
      }

    });
  }, 60000);
}

module.exports = wsClient