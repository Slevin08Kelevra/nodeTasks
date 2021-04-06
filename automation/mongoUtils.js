const { MongoClient } = require("mongodb");
const props = require('./props.js')

const mongoUtils = []

mongoUtils.startAllReplicas = async (mongoInstances) => {
    console.log("testing mongo utils")
    mongoInstances.forEach(instance => {

    });
}

mongoUtils.stopAllReplicas = async (mongoInstances) => {


}

mongoUtils.replicaSetReconf = async (mongoInstances) => {
    let url = prepareUrl(mongoInstances)
    let statusList = await executeCommandOnMongo(url, { replSetGetStatus: 1 })
    return statusList
}

mongoUtils.showReplicasStatus = async (mongoInstances) => {

    let url = prepareUrl(mongoInstances)

    let doAndCheckCmds = []
    let doAndCheckCmd = {
        do: () => { return { replSetGetStatus: 1 } },
        check: (result) => {
            if (!result) {
                throw new Error('Error: replSetGetStatus is empty')
            }
        }
    }
    doAndCheckCmds.push(doAndCheckCmd)

    let result = await executeCommandOnMongo(url, doAndCheckCmds, true)
    return result.members.map((member) => {
        let health = (member.health === 1) ? 'OK' : 'KO'
        let match = member.name.match(/^(?<domain>[A-Za-z0-9-]{1,50}\.[A-Za-z0-9-]{1,50}\.[A-Za-z]{2,6})/)
        let host = match.groups.domain
        let stateStr = member.stateStr
        return `${host} ${stateStr} ${health}`

    });
}

const urlTemplate = 'mongodb://%s:%s@%s/admin?replicaSet=%s&tls=true'
function prepareUrl(mongoInstances) {
    let hosts = []
    mongoInstances.forEach((instance) => {
        hosts.push(`${instance.mongoHost}:${props.mongo.port}`)
    })
    let params = [props.mongo.user, props.mongo.pass, hosts.join(','), props.mongo.replica_id]
    let i = 0
    return urlTemplate.replace(/%s/g, () => params[i++]);
}

async function executeCommandOnMongo(url, doAndCheckCmds, secure) {

    let result = []
    let client
    let secureClient = new MongoClient(url, {
        tlsCAFile: `/home/pablo/certTest/actual/mongoCA.crt`,
        tlsCertificateKeyFile: `/home/pablo/certTest/actual/mongo1.pem`,
        useUnifiedTopology: true
    });
    let insecureClient = new MongoClient(url, {
        useUnifiedTopology: true
    });
    client = (secure)?secureClient:insecureClient
    try {
        await client.connect();
        let db = client.db("admin");
        for (let doAndCheckCmd of doAndCheckCmds) {
            result = await db.command(doAndCheckCmd.do());
            doAndCheckCmd.check(result)
        } 

    } catch (err) {
        console.log(err)
        throw err
    } finally {
        await client.close();
    }
    return result
}

module.exports = mongoUtils