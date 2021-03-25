const awsUtils = require('./../../awsUtils.js')
const hostile = require('hostile')

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
    'hosts fix': async () => {
        let instancesList = await awsUtils.describeFiltered()
        let fixHosts = getFixHostsFunc(instancesList)()
        return 'fixed'
    }

}

function getFixHostsFunc() {
    return async () => {
        console.log('Fixing hosts:')
        let dataFiltered = await awsUtils.describeFiltered()
        for (const inst of dataFiltered){
            let host = inst.name.toLowerCase().replace(/\-/g, ".")
            let ip = inst.pubIp

            let result = await changeHost(host, ip)
            console.log(result)

            if (host.startsWith("mongodb")) {

                let index = inst.index
                let mongoHost = `srv${index}.mongoaurelio.xyz`

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