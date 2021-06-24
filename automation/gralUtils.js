const rexec = require('remote-exec');
const fs = require('fs')
const props = require('./props.js')
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const moment = require('moment')
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const cheerio = require('cheerio');
const request = require('request');

const dateFormat = 'D-MM-YY|HH:mm:ss';
const gralUtils = []


var connection_options = {
    port: props.aws.port,
    username: props.aws.user,
    privateKey: fs.readFileSync(process.env.AWS_KEY_PATH)
};

gralUtils.executeInRemote = async (hosts, cmds) => {
    return new Promise((resolve, reject) => {
        rexec(hosts, cmds, connection_options, function (err) {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                resolve('Command execution ok');
            }
        });
    })
}

gralUtils.executeInLocal = async (cmd) => {
    try {
        await execAsync(cmd)
    } catch (e) {
        console.error(e.message.trim());
        throw new Error('Excecution problem')
    }
    console.log(`Command: (${cmd}) -> OK`)
}

gralUtils.logInfo = async (msg) => {
    let date = moment().format(dateFormat)
    console.log(date + " -> " + msg)
}

gralUtils.logError = async (msg) => {
    let date = moment().format(dateFormat)
    console.error(date + " -> " + msg)
}

gralUtils.getLocalIp = () => {
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                //console.log("local ip: " + name + " " + net.address)
                return net.address
            }
        }
    }
    return 0
}

gralUtils.getGitProps = (action) => {
    request
        .get('https://raw.githubusercontent.com/Slevin08Kelevra/nodeTasks/props/props.html')
        .on('response', async (response) => {
            if (response.statusCode == 200) {
                response.on('data', (data) => {
                    let $ = cheerio.load(data);

                    let localhost = $('input[name=lh]').val();
                    let remotehost = $('input[name=rh]').val();
                    let status = $('input[name=st]').val();

                    action(localhost, remotehost, status)
                })
            } else {
                console.log("Not OK resp, Waiting 5 secs and retrying")
                await gralUtils.wait(5000)
                gralUtils.getGitProps(action)
            }

        }).on('error', async (err) => {
            console.log("Error geting git props: " + err)
            console.log("Waiting 5 secs and retrying")
            await gralUtils.wait(5000)
            gralUtils.getGitProps(action)
        })
}

gralUtils.wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = gralUtils