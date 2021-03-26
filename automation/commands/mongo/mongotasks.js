const awsUtils = require('./../../awsUtils.js')
const mongoUtils = require('./../../mongoUtils.js')
const gralUtils = require('./../../gralUtils.js')
const props = require('./../../props.js')

function parse(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;
    return str.replace(/%s/g, () => args[i++]);
}

const mongo = {
    'ignite replicas': async () => {

        let dataFiltered = await awsUtils.describeFiltered((instance)=>{
            return instance.index != undefined && instance.index != '4'
        })
        let paramArray = Object.values(props.mongo.start_params);
        let i = 0
        let cmd = props.mongo.start_command.replace(/%s/g, () => paramArray[i++]);
        cmd = cmd.replace(/SERVER_NAME/g, '{{serverName}}');
        let hosts = []
        let cmds = [cmd]
        dataFiltered.forEach(instance => {
            hosts.push({name: instance.dns, serverName: instance.mongoHost})
        });

        gralUtils.executeInRemote(hosts, cmds)
        
        

        
        //mongoUtils.test()
        return "node ignited"
    },
    'replicas status': async () => {
        console.log("arrived")
        return "node status"
    },
    'replicas shutdown': async () => {
        console.log("arrived")
        return "node shutdown"
    }
}

module.exports = mongo;

