var AWS = require('aws-sdk');
const { MongoClient } = require("mongodb");

var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
var params = {
    Filters: [
        {
            Name: "instance-type",
            Values: [
                "t2.micro"
            ]
        }
    ]
};

var ec2 = new AWS.EC2({ region: 'us-east-2' });

ec2.describeInstances(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
        process.exit(1)
    }
    else {
        awsData = data
        data.Reservations.filter(res => {
            let name = res.Instances[0].Tags.find(tag => {
                return tag.Key === "Name"
            }).Value
            return name.startsWith("mongodb") && name  !== "mongodb4"
        }).forEach(res => {
            console.log(res.Instances[0].InstanceId)
            let index = res.Instances[0].Tags.find(tag => {
                return tag.Key.toLowerCase() === "index"
            }).Value
            stopNode(`srv${index}.mongoaurelio.xyz`)
        });
    }
});

async function stopNode(dns) {
    let url = `mongodb://admin:1234qwer@${dns}:27026/admin?tls=true&authMode=scram-sha1`
    let client = new MongoClient(url, {
        tlsCAFile: `/home/pablo/certTest/actual/mongoCA.crt`,
        tlsCertificateKeyFile: `/home/pablo/certTest/actual/mongo1.pem`,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db("admin");
        const result = await db.command({
            //"replSetGetStatus": 1
            shutdown: 1,
            force: false,
            timeoutSecs: 3,
            comment: 'Shuting down for maintenance'
        });
        console.log(result);
    } catch (err){
        console.log(err)
    } finally {
        await client.close();
    }
}