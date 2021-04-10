const awsUtils = require('./../../awsUtils.js')
const mongoUtils = require('./../../mongoUtils.js')
const gralUtils = require('./../../gralUtils.js')
const props = require('./../../props.js')

const simpleFilter = (instance) => {
    return instance.index != undefined && instance.index != '4'
}

const mongo = {
    'ignite.replicas': async () => {

        let result = []
        try {
            let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
            let paramArray = Object.values(props.mongo.start_params);
            let i = 0
            let cmd = props.mongo.start_command.replace(/%s/g, () => paramArray[i++]);
            cmd = cmd.replace(/SERVER_NAME/g, '{{serverName}}');
            let hosts = []
            let cmds = [cmd]
            dataFiltered.forEach(instance => {
                hosts.push({ name: instance.dns, serverName: instance.mongoHost })
            });

            let cmdResult = await gralUtils.executeInRemote(hosts, cmds)
            result.push('Ignite replica set: ⤵')
            result.push(cmdResult)

        } catch (error) {
            result.push(error.message)
        }


        return result
    },
    'replica.set.report': async () => {

        let statusList
        try {
            let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
            statusList = await mongoUtils.showReplicasStatus(dataFiltered)
        } catch (error) {
            statusList = [error.message]
        }

        return statusList
    },
    'replica.set.shutdown': async () => {
        let result = []
        try {
            let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
            let cmd = props.mongo.kill_command

            let hosts = []
            let cmds = [cmd]
            dataFiltered.forEach(instance => {
                hosts.push(instance.dns)
            });

            let cmdResult = await gralUtils.executeInRemote(hosts, cmds)
            result.push('Replica set shutdown: ⤵')
            result.push(cmdResult)
        } catch (error) {
            result.push(error.message)
        }

        return result

    },
    'replica.set.update.configuration': async () => {

        let dataFiltered = await awsUtils.describeFiltered(simpleFilter)
        let statusList = await mongoUtils.replicaSetReconf(dataFiltered)

        console.log(statusList)

        return statusList

        return ["Updating configuration"]
    }
}

module.exports = mongo;

