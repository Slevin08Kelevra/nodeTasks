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
        startInstance(ids)
    }
});

function startInstance(ids){
    var params = {
        InstanceIds: ids
       };
       ec2.startInstances(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else     {          // successful response
            data.StartingInstances.forEach(inst =>{
                console.log(inst.InstanceId + " started")
            })
         }
         /*
         data = {
          StartingInstances: [
             {
            CurrentState: {
             Code: 0, 
             Name: "pending"
            }, 
            InstanceId: "i-1234567890abcdef0", 
            PreviousState: {
             Code: 80, 
             Name: "stopped"
            }
           }
          ]
         }
         */
       });

}