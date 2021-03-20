var AWS = require('aws-sdk');

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

const awsUtils = []

awsUtils.describeAll = async () => {
    return new Promise((resolve, reject) => {
        ec2.describeInstances(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                reject(err)
            }
            else {
                resolve(data)
            }
        });
    })
}

awsUtils.describeFiltered = async () => {
    let data = await awsUtils.describeAll()
    let instances = []
    data.Reservations.forEach(res => {
        let instance = {}
        instance.id = res.Instances[0].InstanceId
        instance.privateIp = res.Instances[0].PrivateIpAddress
        instance.dns = res.Instances[0].PublicDnsName
        instance.pubIp = res.Instances[0].PublicIpAddress
        instance.status = res.Instances[0].State.Name
        instance.name = res.Instances[0].Tags.find(tag => {
            return tag.Key === "Name"
        }).Value

        instances.push(instance)
    })
    
    return instances
}


module.exports = awsUtils