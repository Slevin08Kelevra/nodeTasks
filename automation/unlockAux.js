const SerialPort = require('serialport')
var myArgs = process.argv.slice(2);

ArduinoPort = new SerialPort("COM4", { baudRate: 9600 })
ArduinoPort.on('open', function () {
    ArduinoPort.write(myArgs[0], function (err, result) {
        if (err) {
            console.log('ERROR: ' + err);
        }
        console.log('OK: arduino cmd received')
    });
})