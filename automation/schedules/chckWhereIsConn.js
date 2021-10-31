const schedule = require('node-schedule');
const { exec } = require('child_process');
const simpleGit = require('simple-git');
var fs = require('fs')
const gralUtils = require("./../gralUtils");
const awsUtils = require("./../awsUtils");
const props = require('./../props')
const wsClient = require('./../wsClient')

var wsConns

const findCentinel = (instance) => {
    return instance.name == 'centinel'
}

let retrying = false
let retries = 0

if (process.env.CHK_PHONE) {
    startSchedule()
}

function startSchedule() {
    schedule.scheduleJob('*/1 * * * *', function () {

        if (!retrying) {
            checkPhoneConnected()
        }

    });
}




var phoneConnectedToWifi;
var awsCentinelIpOld

function checkPhoneConnected() {
    let ubuntuIp = gralUtils.getLocalIp()
    let cmd = props.schedules.phone_find_ip_cmd
    retries++
    exec(cmd, async (error, stdout, stderr) => {
        if (error || stderr) {
            gralUtils.logError(`exec error: ${error}`);
            return;
        }
        if (stdout.trim() != props.schedules.phone_mac) {
            retrying = true
            if (retries <= 4) {
                setTimeout(() => {
                    checkPhoneConnected()
                }, 12000);
            } else {
                retrying = false
                retries = 0
                if (typeof phoneConnectedToWifi === 'undefined' || phoneConnectedToWifi) {
                    phoneConnectedToWifi = false
                    gralUtils.logInfo("phone outside!")
                    let data = await awsUtils.startAllInstances(findCentinel)
                    let ids = data.map((inst) => {
                        return inst.id
                    })
                    awsUtils.waitFor(awsUtils.waitStatus['run'], ids, async (instData) => {
                        gralUtils.logInfo("centinel started!")

                        console.log('Fixing hosts:')
                        await gralUtils.executeInLocal(props.aws.remove_my_local_hosts)
                        await gralUtils.executeInLocal(props.aws.add_my_host_title)
                        
                        for (const inst of instData) {
                            let host = inst.name.toLowerCase()
                            let ip = inst.pubIp
                            let i = 0, params = [ip, host]
                            let addHost = props.aws.add_new_host.replace(/%s/g, () => params[i++]);
                            await gralUtils.executeInLocal(addHost)
                            
                        }

                        let awsCentinelIp = instData.map((inst) => { return inst.pubIp }).find(ip => true)
                        awsCentinelIpOld = awsCentinelIp
                        setTimeout(() => {
                            wsClient.start(awsCentinelIp, "pepe")
                        }, 60000);
                        writeFileFromTemplate("pepe", ubuntuIp, awsCentinelIp)
                    })
                }

            }

        } else {
            retrying = false
            retries = 0
            if (typeof phoneConnectedToWifi === 'undefined' || !phoneConnectedToWifi) {
                phoneConnectedToWifi = true
                gralUtils.logInfo("phone in home!")

                wsClient.send(`BI-INSTRUCTION:connect2home:${ubuntuIp}:wifi`)
                await gralUtils.wait(10000)
                gralUtils.logInfo("Instructing BI to change to wifi and stoping ubuntu ws client")
                wsClient.stop()

                let data = await awsUtils.shtudownAllInstances(findCentinel)
                let ids = data.map((inst) => {
                    return inst.id
                })
                awsUtils.waitFor(awsUtils.waitStatus['stop'], ids, () => {
                    gralUtils.logInfo("centinel stopped!")
                    writeFileFromTemplate("wifi", ubuntuIp, "none")
                })
            }

        }

    });

}

function writeFileFromTemplate(status, wifi, pepe) {
    let git = simpleGit(props.schedules.git_prop_folder);
    let someFile = props.schedules.git_prop_template
    let destFile = props.schedules.git_prop_file
    fs.readFile(someFile, 'utf8', function (err, data) {
        if (err) {
            return gralUtils.logError(err);
        }
        var result = data.replace(/VALUE_RH/g, pepe);
        result = result.replace(/VALUE_LH/g, wifi);
        result = result.replace(/VALUE_ST/g, status);

        fs.writeFile(destFile, result, 'utf8', async (err) => {
            if (err) return gralUtils.logError(err);
            await git.add('./props.html').commit("Changing data!").push();
            
            if (wsConns.get("BI_COMPUTER") && status === "pepe") {
                let { ws, obs } = wsConns.get("BI_COMPUTER")
                let comProt = validator.getComProt()
                comProt.data = "ws-restart"
                ws.send(comProt.prepare())
                let message = ""
                try {
                    message = await obs.expect()
                } catch (error) {
                    message = error
                }

                gralUtils.logInfo(message)
            }
        });
    });
}

const checker = []
checker.setWsConns = (wc)=>{
    wsConns = wc
}

module.exports = checker