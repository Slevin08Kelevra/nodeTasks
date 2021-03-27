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

mongoUtils.showReplicasStatus = async (mongoInstances) => {

    let url = prepareUrl(mongoInstances)
    let statusList = await executeCommandOnMongo(url, {replSetGetStatus: 1})
    return statusList
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

async function executeCommandOnMongo(url, command) {

    let statusList = []
    let client = new MongoClient(url, {
        tlsCAFile: `/home/pablo/certTest/actual/mongoCA.crt`,
        tlsCertificateKeyFile: `/home/pablo/certTest/actual/mongo1.pem`,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db("admin");
        const result = await db.command(command);
        result.members.forEach((member)=>{
           let health = (member.health === 1)?'OK':'KO'
           let match = member.name.match(/^(?<domain>[A-Za-z0-9-]{1,50}\.[A-Za-z0-9-]{1,50}\.[A-Za-z]{2,6})/) 
           let host = match.groups.domain
           let stateStr = member.stateStr
           statusList.push(`${host} ${stateStr} ${health}`)
           
        });
    } catch (err) {
        console.log(err)
    } finally {
        await client.close();
    }
    return statusList
}

module.exports = mongoUtils