const { resolveSrv } = require('dns');
var wincmd = require('node-windows');
var Service = wincmd.Service;

// Create a new service object
var svc = new Service({
    name: 'Mongo Forward Monitor',
    description: 'Service for monitoring oc connection and port forwarding form mongo connection.',
    script: 'mongoConnectMonitor.js',
    env: {
        name: "MONIT_HOME",
        value: "C:/repos/nodeAuto"
    },
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
    //, workingDirectory: '...'
    //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

switch (myArgs[0]) {
    case 'install':
        install()
        break;
    case 'uninstall':
        uninstall()
        break;
    case 'list':
        list(false)
        break;
    case 'kill':
        list(true)
        break;
    default:
        console.log('Sorry, that is not something I know how to do.');
        process.env['HOME']
}

function install() {
    svc.install();
}

function uninstall() {
    svc.uninstall();
}

function kill(pid) {
    wincmd.kill(pid, function () {
        console.log('Process Killed');
    });
}


function list(doKill) {
    wincmd.list(function (svc) {

        let result = svc.find(service => {
            if (service.Nombredeimagen) {
                return service.Nombredeimagen === "mongoforwardmonitor.exe"
            } else {
                return service.ImageName === "mongoforwardmonitor.exe"
            }

        });
        console.log(result);
        if (doKill && result) {
            kill(result.PID)
        } else if (!result.PID) {
            console.log("PID not found!")
        }
    }, true);
}
