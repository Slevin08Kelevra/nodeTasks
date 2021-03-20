const awsUtils = require('./../../awsUtils.js')

let amazon = {

    'test': function () {
        console.log("arrived")
        return "saranga"
    },
    'ignite.servers': function () {
        console.log("arrived")
        return "saranga"
    },
    'servers.shutdwon': function () {
        console.log("arrived")
        return "saranga"
    },
    'servers.status': async () => {

        data = await awsUtils.describeFiltered()

        let status = []
        data.forEach((inst) => {
            status.push(`${inst.id} -> ${inst.status}`)
        })
 
        return status
    }

}

module.exports = amazon;