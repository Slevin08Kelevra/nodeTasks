const rexec = require('remote-exec');
const  fs = require('fs')

const gralUtils = []


var connection_options = {
    port: 22,
    username: 'ubuntu',
    privateKey: fs.readFileSync('/home/pablo/dumps/firstKey.pem')
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