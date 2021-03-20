const awsUtils = require('./../../awsUtils.js')

let amazon = {

    'test': async ()=> {
        console.log("arrived")
        return "saranga"
    },
    'ignite.servers': async () => {
        data = await awsUtils.startAllInstances()

        let status = []
        data.forEach((inst) => {
            status.push(`${inst.id} -> ${inst.status}`)
        })
 
        return status
    },
    'servers.shutdwon': async () => {
        data = await awsUtils.shtudownAllInstances()

        return data.map((inst) => {
            return `${inst.id} -> ${inst.status}`
        })
    },
    'servers.status': async () => {

        data = await awsUtils.describeFiltered()

        return data.map((inst) => {
            return `${inst.id} -> ${inst.status}`
        })
    }

}

module.exports = amazon;