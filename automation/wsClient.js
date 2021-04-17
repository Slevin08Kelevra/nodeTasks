const WebSocket = require('ws');
const fs = require('fs');
const validator = require("./reqValidator")
//var robot = require("robotjs");
//var ks = require('node-key-sender');

var privateKey = fs.readFileSync(__dirname + '/certs/client-key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/client-crt.pem', 'utf8');

const wss = new WebSocket('wss://192.168.1.132:8095',{
    protocolVersion: 8,
    origin: 'https://192.168.1.132:8095',
    rejectUnauthorized: false,
    key: privateKey,
    cert: certificate,
    headers: {"authorization": validator.generateToken()}
  });

wss.on('open', function open() {
  wss.send('something');
});

wss.on('message', function incoming(data) {
  
  setTimeout(() => {  
    
    //console.log(data)
    //robot.typeString("Charly01Garcia");
    //ks.sendKey('windows')
    //ks.sendCombination(['windows', 'l']);
    //ks.sendKeys(['C', 'h', 'a','r', 'l', 'y','0', '1', 'G','a', 'r', 'c','i', 'a']);
    
   }, 2000);
  
  console.log(data);
});