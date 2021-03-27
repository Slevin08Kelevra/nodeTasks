const awsUtils = require('./../../awsUtils.js')
const mongoUtils = require('./../../mongoUtils.js')
const gralUtils = require('./../../gralUtils.js')
const props = require('./../../props.js')

const simpleFilter = (instance)=>{
    return instance.index != undefined && instance.index != '4'
}

const mongo = {
    'ignite replicas': async () => {

        let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
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
    
        return "node ignited"
    },
    'replica set report': async () => {
        
        let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
        let statusList = await mongoUtils.showReplicasStatus(dataFiltered)

        return statusList
    },
    'replica set shutdown': async () => {
        
        let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
        let cmd = props.mongo.kill_command

        let hosts = []
        let cmds = [cmd]
        dataFiltered.forEach(instance => {
            hosts.push(instance.dns)
        });

        gralUtils.executeInRemote(hosts, cmds)

        return "node shutdown"
    }
}

module.exports = mongo;

