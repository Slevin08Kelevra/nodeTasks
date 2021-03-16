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

ec2.describeInstances(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
        process.exit(1)
    }
    else {
        var ids = []
        data.Reservations.forEach(res => {
            ids.push(res.Instances[0].InstanceId)
        })
        stopInstance(ids)
    }
});

function stopInstance(ids){
    var params = {
        InstanceIds: ids
       };
    ec2.stopInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        {          // successful response
            data.StoppingInstances.forEach(inst =>{
                console.log(inst.InstanceId + " stoped")
            })
         }
        /*
        data = {
         StoppingInstances: [
            {
           CurrentState: {
            Code: 64, 
            Name: "stopping"
           }, 
           InstanceId: "i-1234567890abcdef0", 
           PreviousState: {
            Code: 16, 
            Name: "running"
           }
          }
         ]
        }
        */
      });
}

function main(){

}

function describeInstances(){
    ec2.describeInstances(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            process.exit(1)
        }
        else {
            data.Reservations.forEach(res => {
                console.log(res.Instances[0].PublicDnsName)
            })
        }
    });
}

function stopAllInstances(){

}
