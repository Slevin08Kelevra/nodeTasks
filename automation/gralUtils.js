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
    rexec(hosts, cmds, connection_options, function(err){
        if (err) {
            console.log(err);
        } else {
            console.log('Command execution ok');
        }
    });
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