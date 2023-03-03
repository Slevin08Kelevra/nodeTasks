const { SerialPort } = require('serialport')
var myArgs = process.argv.slice(2);

let path = ''
let ArduinoPort = ''
SerialPort.list().then(ports => {
    let done = false
    let count = 0
    let allports = ports.length
    ports.forEach(function (port) {
        count = count + 1
        pm = port.manufacturer

        if (typeof pm !== 'undefined' && pm.includes('Microsoft')) {
            path = port.path
            ArduinoPort = new SerialPort({ path: path, baudRate: 9600 })
            ArduinoPort.on('open', function () {
                ArduinoPort.write(myArgs[0], function (err, result) {
                    if (err) {
                        console.log('ERROR: ' + err);
                    }
                    console.log('OK: arduino cmd received')
                });
            })
            done = true
        }
        if (count === allports && done === false) {
            console.log(`ERROR: can't find any arduino`)
        }
    })
})