const WebSocket = require('ws');
const fs = require('fs');
const validator = require("./reqValidator")
const shell = require('node-powershell');
const ks = require('node-key-sender');
const SerialPort = require('serialport')
const { exec } = require('child_process');
const gralUtils = require('./gralUtils');
const shell2 = require('shelljs');

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
  let wsPort = validator.getWebSocketPort()
  wss = new WebSocket(`wss://${ip}:${wsPort}`, {
    protocolVersion: 8,
    origin: `wss://${ip}:${wsPort}`,
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
    if (failedConnectionsTries > 10) {
      console.log("To many errors restarting in 3 secs!!!")
      restart()
    }
    failedConnectionsTries++
    gralUtils.logError("Socket client error: " + error.message)
  });

  wss.on('message', function incoming(message) {
    if (!validator.protocolCheck(message)) {
      gralUtils.logInfo('Wrong communication protocols structure!')
    } else {
      let action = validator.comProtExtract(message).data
      if (action.startsWith('connect2home:')) {
        let ipAndstatus = action.replace("connect2home:", "").split(':')
        gralUtils.logInfo("Trying to desconnect ws from aws and connect home")
        wsClient.stop()
        setTimeout(() => {
          wsClient.start(ipAndstatus[0], ipAndstatus[1])
        }, 10000);
      }

      let comProt = validator.getComProt();

      switch (action) {
        case "extractCertificates":
          extractCertificates()
          break;
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
          comProt.data = "BI comp ws restarting in 60 seconds!"
          wss.send(comProt.prepare())
          break;
        case "ruok":
          comProt.data = "Ubuntu is fine, Sir!(vc-vib:2)"
          wss.send(comProt.prepare())
          break;
        case "rualive":
          comProt.data = "Bi comp is fine, Sir!(vc-vib:2)"
          wss.send(comProt.prepare())
          break;
        case "restart-app":

          restart()
          comProt.data = "Restarting in 3 secs!"
          wss.send(comProt.prepare())

          break;
        case "bkupworks":
          comProt.data = shell2.exec('node backWritings.js').toString().trim()
          wss.send(comProt.prepare())
          break;
        default:
          text = "Action not recognized!";
      }

      gralUtils.logInfo("Exec action: " + action);
    }

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
    let comProt = validator.getComProt();
    comProt.data = message
    wss.send(comProt.prepare())
  }
}

wsClient.isConnected = () => {

  return wss && wss.readyState === WebSocket.OPEN
}

function unlock() {
  let clau = validator.getClau()
  exec(`node unlock.js ${clau}`, (err, stdout, stderr) => {
    if (err) {
      gralUtils.logError(err);
      return;
    }
    let comProt = validator.getComProt();
    comProt.data = stdout
    wss.send(comProt.prepare())
  });
}

function extractCertificates() {
  gralUtils.logInfo('Extracting certs from ubuntu!')
  exec(`node extractCerts.js`, (err, stdout, stderr) => {
    if (err) {
      gralUtils.logError(err);
      return;
    }
    if (stdout) {
      gralUtils.logInfo(stdout);
      return;
    }
    if (stderr) {
      gralUtils.logInfo(stderr);
      return;
    }
    let comProt = validator.getComProt();
    comProt.data = stdout
    wss.send(comProt.prepare())
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
    let comProt = validator.getComProt;
    comProt.data = "key sent!!!"
    wss.send(comProt.prepare())
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
    let comProt = validator.getComProt()
    comProt.data = data
    wss.send(comProt.prepare())
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