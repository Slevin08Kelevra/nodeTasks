const rexec = require('remote-exec');
const  fs = require('fs')

var connection_options = {
    port: 22,
    username: 'ubuntu',
    privateKey: fs.readFileSync('/home/pablo/dumps/firstKey.pem'),
    params: {
        mongodPath: '/home/ubuntu/.mongodb/versions/mongodb-current/bin/mongod',
        nodePath: '/home/ubuntu/mongo/auto',
        myHost: 'srv1.mongoaurelio.xyz',
        myIp: '27026',
        pemPath: '/home/ubuntu/tls/auto/actual/mongo.pem',
        pemPath2: '/home/ubuntu/tls/auto/actual/mongo.pem',
        caPath: '/home/ubuntu/tls/auto/actual/mongoCA.crt',
        logTo: '/home/ubuntu/logs/mongo.log',
        mongoKill: "sudo kill $(ps aux | grep mongod | grep -v 'grep' | awk '{print $2}')"
    }
};

var hosts = [
    'mongodb'
];

var cmds = [
    "{{mongoKill}}"
    //"{{mongodPath}} --auth --dbpath {{nodePath}} --port {{myIp}} --bind_ip {{myHost}} --tlsMode requireTLS --tlsCertificateKeyFile {{pemPath}} --tlsCAFile {{caPath}} --clusterAuthMode x509 --tlsClusterFile {{pemPath2}} --replSet rs0 --fork --logpath {{logTo}}"
];

rexec(hosts, cmds, connection_options, function(err){
    if (err) {
        console.log(err);
    } else {
        console.log('Great Success!!');
    }
});