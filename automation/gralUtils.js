const rexec = require('remote-exec');
const  fs = require('fs')
const props = require('./props.js')

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

module.exports = gralUtils