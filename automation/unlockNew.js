
/* 
  You showld install this version
  npm install serailport@10.5.0

  falta ver logs que tenga sentido la secuencia
  respues de arduino para completar el circuito
*/

const { autoDetect } = require('@serialport/bindings-cpp')
const Binding = autoDetect()
const { SerialPort } = require("serialport")
const dgram = require('dgram')
const server = dgram.createSocket('udp4')
const client = dgram.createSocket('udp4');

var serialPort = null
var reSend = false;

/* UDP configuration */
server.bind(8286)
client.bind(8283, function () { client.setBroadcast(true) });
server.on('listening', function () {
  var address = server.address()
  console.log('UDP Server listening on ' + address.address + ":" + address.port)
});
server.on('message', function (action, remote) {
  console.log(remote.address + ':' + remote.port + ' - ' + action)
  if (action == "UNLOCK_MACHINE") {
    if (serialPort == null) {
      reSend = true;
      initSerial()
    } else {
      sendMessageToArdu()
    }
  }
});

/* Serial port initialization and functions */
initSerial()

function sendMessageToArdu() {
  serialPort.write("MyPassWord", function (err) {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
    console.log("Message sent to the board successfully");
    const message = Buffer.from("MESSAGE_SENT");
    client.send(message, 8284, '192.168.1.255', (err) => {
      if (err) {
        return console.log("Error sending UDP response: ", err.message);
      }
    });
  });
}

function initSerial() {
  Binding.list().then(getSerialPathAndInit, err => {
    process.exit(1)
  })
}

function getSerialPathAndInit(ports) {
  ports.forEach(port => {
    if (port.serialNumber !== 'undefined' && port.serialNumber.includes('7&193A4C3E&0&0000')) {
      console.log(port.serialNumber)
      serialPort = new SerialPort({ path: port.path, baudRate: 9600 })
      if (reSend) {
        sendMessageToArdu()
        reSend = false
      }
      serialPort.on('error', function (err) {
        console.log('Error: ', err.message)
        if (err.message.includes("Unknown error code 22")) {
          initSerial()
          reSend = true;
        }
      })

    }
  });
}


