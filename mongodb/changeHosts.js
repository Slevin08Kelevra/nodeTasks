var hostile = require('hostile')
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

start()

async function start(){
    ec2.describeInstances(params, async function (err, data) {
        if (err) {
            console.log(err, err.stack);
            process.exit(1)
        }
        else {
            for (const res of data.Reservations){
                let name = res.Instances[0].Tags.find(tag => {
                    return tag.Key === "Name"
                }).Value.toLowerCase().replace(/\-/g, ".")
                let ip = res.Instances[0].PublicIpAddress
                
                let result = await changeHost(name, ip)
                console.log(result)
            }
        }
    });
}

async function changeHost(host, ip){
    return new Promise((resolve, reject) => {
        hostile.set(ip, host, function (err) {
            if (err) {
              reject(err)
            } else {
                resolve(host + ' seted')
            }
          })
    })
    
}

