const WebSocket = require('ws');
const fs = require('fs');
const validator = require("./reqValidator")
const shell = require('node-powershell');
const ks = require('node-key-sender');
const SerialPort = require('serialport')
const { exec } = require('child_process');

var privateKey = fs.readFileSync(__dirname + '/certs/client-key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/client-crt.pem', 'utf8');

const wss = new WebSocket('wss://192.168.1.132:8095', {
  protocolVersion: 8,
  origin: 'https://192.168.1.132:8095',
  rejectUnauthorized: false,
  key: privateKey,
  cert: certificate,
  headers: { "authorization": validator.generateToken(), "client-id": "BI_COMPUTER" }
});

wss.on('open', function open() {
  //wss.send('something');
});

wss.on('message', function incoming(action) {

  switch (action) {
    case "showMyInf":
      showMyInf()
      break;
    case "unlock":
      unlock()
      break;
    default:
      text = "Action not recognized!";
  }

  console.log("doing: " + action);
});

function unlock() {
  exec('node unlock.js Alvaro01Costarica', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
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
    console.log(err);
    ps.dispose();
  });
}