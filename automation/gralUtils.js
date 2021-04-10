const rexec = require('remote-exec');
const  fs = require('fs')
const props = require('./props.js')
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const gralUtils = []


var connection_options = {
    port: props.aws.port,
    username: props.aws.user,
    privateKey: fs.readFileSync(props.aws.key)
};

gralUtils.executeInRemote = async (hosts, cmds) => {
    return new Promise((resolve, reject) => {
        rexec(hosts, cmds, connection_options, function(err){
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

module.exports = gralUtils