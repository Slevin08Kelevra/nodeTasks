const awsUtils = require('./../../awsUtils.js')
const hostile = require('hostile')
const gralUtils = require('./../../gralUtils.js')
const props = require('./../../props.js')

const simpleFilter = (instance) => {
    return instance.index != undefined && instance.index != '4'
}

const amazon = {

    'test': async () => {
        console.log("arrived")
        return "saranga"
    },
    'ignite.servers': async () => {
        let data = await awsUtils.startAllInstances()

        let fixHosts = getFixHostsFunc()
        let ids = data.map((inst) => {
            return inst.id
        })
        awsUtils.waitFor(awsUtils.waitStatus['run'], ids, fixHosts)

        let status = []
        data.forEach((inst) => {
            status.push(`${inst.id} -> ${inst.status}`)
        })

        return status
    },
    'servers.shutdown': async () => {

        let data = await awsUtils.shtudownAllInstances()

        return data.map((inst) => {
            return `${inst.id} -> ${inst.status}`
        })
    },
    'servers.status': async () => {

        let data = await awsUtils.describeFiltered()

        return data.map((inst) => {
            return `${inst.id} -> ${inst.status}`
        })
    },
    'fix local hosts': async () => {
        let instancesList = await awsUtils.describeFiltered()
        getFixHostsFunc(instancesList)()

        return ['fixing hosts']
    },
    'fix remote hosts': async () => {

        let dataFiltered = await awsUtils.describeFiltered(simpleFilter)

        let hosts = []
        let cmds = [props.aws.remove_old_hosts]
        //let cmd = props.add_mongo_host_title
        //cmds.push(cmd)

        dataFiltered.forEach(instance => {
            hosts.push(instance.dns)

            let i = 0, params = [instance.privateIp, instance.mongoHost]
            let cmd = props.aws.add_new_host.replace(/%s/g, () => params[i++]);
            cmds.push(cmd)
        });

        gralUtils.executeInRemote(hosts, cmds)

        return ["Fixing remote hosts"]
    }

}

function getFixHostsFunc() {
    return async () => {
        console.log('Fixing hosts:')
        await gralUtils.executeInLocal(props.aws.remove_my_local_hosts)
        let dataFiltered = await awsUtils.describeFiltered()
        for (const inst of dataFiltered) {
            let host = inst.name.toLowerCase().replace(/\-/g, ".")
            let ip = inst.pubIp

            let result = await changeHost(host, ip)
            console.log(result)

            if (host.startsWith("mongodb")) {

                let index = inst.index
                let mongoHost = `srv${index}.${props.mongo.domain}`

                result = await changeHost(mongoHost, ip)
                console.log(result)
            }
        }
    }
}

async function changeHost(host, ip) {
    return new Promise((resolve, reject) => {
        hostile.set(ip, host, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve(host + ' fixed')
            }
        })
    })

}

module.exports = amazon;