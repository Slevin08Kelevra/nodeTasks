var SerialPort = require("serialport");
var port = "COM6";
var message = "Hakuna Matata";

var serialPort = new SerialPort(port, {
  baudRate: 9600
});

serialPort.write(message, function(err) {
  if (err) {
    return console.log("Error on write: ", err.message);
  }
  console.log("Message sent successfully");
});