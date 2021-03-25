const awsUtils = require('./../../awsUtils.js')
const mongoUtils = require('./../../mongoUtils.js')

const mongo = {
    'ignite replicas': async () => {
        console.log("arrived")
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