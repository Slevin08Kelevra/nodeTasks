const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const fs = require('fs')
const yaml = require('js-yaml');
var AWS = require('aws-sdk');
const { MongoClient } = require("mongodb");

var url = ""
const client = new MongoClient(url, {
    tlsCAFile: `/home/pablo/certTest/actual/mongoCA.crt`,
    tlsCertificateKeyFile: `/home/pablo/certTest/actual/mongo3.pem`,
    useUnifiedTopology: true
});

async function run() {
    try {
        await client.connect();
        const db = client.db("admin");
        const result = await db.command({
            shutdown: 1
        });
        console.log(result);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);



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
var dnsNames = {}

var funcs = []

funcs.getMongoNodeCmdExecutor = (args) => {
    let func = async () => {
        const client = new MongoClient(args.cmd, {
            tlsCAFile: args.ca,
            tlsCertificateKeyFile: args.cert,
            useUnifiedTopology: true
        });
        try {
            await client.connect();
            const db = client.db("admin");
            const result = await db.command({
                shutdown: 1
            });
            console.log(result);
        } catch (err) {
            console.error(err)
            throw args.name + ' execution aborted'
        } finally {
            await client.close();
        }
    }
    return new command(func)
}

funcs.getFileChecker = (args) => {
    let func = async () => {
        try {
            if (fs.existsSync(args.path)) {
                console.log(args.name + ": OK")
                return
            }
        } catch (err) {
            console.error(err)
            throw args.name + ' execution aborted'
        }
        throw args.name + ` execution aborted: ${args.path} does not exist`
    }
    return new command(func)
}

funcs.getSimpleChildExecutor = (args) => {
    let func = async () => {
        try {
            await execAsync(args.cmd)
        } catch (e) {
            console.error(e.message.trim());
            throw args.name + ' execution aborted'
        }
        console.log(args.name + ": OK")
    }
    return new command(func)
}

funcs.getChildExecutorWithReturn = (args) => {
    let func = async () => {
        try {
            const { stdout, stderr } = await execAsync(args.cmd)
            if (stderr != "") {
                throw "error"
            } else {
                console.log(stdout.trim())
            }
        } catch (e) {
            console.error(e.message.trim());
            throw args.name + ' execution aborted'
        }
        console.log(args.name + ": OK")
    }
    return new command(func)
}

// Get document, or throw exception on error
var props
try {
    props = yaml.load(fs.readFileSync('commandProps.yaml', 'utf8'));
} catch (e) {
    console.log(e);
    process.exit(1)
}

process.chdir(props.general_vars.dir);

let commands = []
let awsData

function prepareCommands() {
    props.create_certs.forEach(action => {
        let fn = action.function
        if (action.cmd_args) {
            action.args.cmd = parse(action.args.cmd, ...action.cmd_args)
        }
        if (action.name_args) {
            action.args.name = parse(action.args.name, ...action.name_args)
        }
        if (fn in funcs && typeof funcs[fn] === "function") {
            if (action.node_repeat) {
                for (let index = 1; index <= props.general_vars.replica_size; index++) {
                    let argsCloned = {}
                    Object.assign(argsCloned, action.args)
                    argsCloned.cmd = argsCloned.cmd.replace(/%i/g, index)
                    argsCloned.cmd = argsCloned.cmd.replace(/%POD_NAME/g, dnsNames[`${index}`])
                    argsCloned.name = argsCloned.name.replace(/%i/g, index)
                    commands.push(funcs[fn](argsCloned))
                }
            } else if (action.special_node) {
                let dns = awsData.Reservations.find(res => {
                    return res.Instances[0].Tags.find(tag => {
                        return tag.Key === "Name"
                    }).Value == action.special_node
                }).Instances[0].PublicDnsName
                action.args.cmd = action.args.cmd.replace(/%POD_NAME/g, dns)
                commands.push(funcs[fn](action.args))
            } else {
                commands.push(funcs[fn](action.args))
            }
        } else {
            console.error(fn + " not found!")
            process.exit(1)
        }

    });
}

ec2.describeInstances(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
        process.exit(1)
    }
    else {
        awsData = data
        data.Reservations.filter(res => {
            return res.Instances[0].Tags.find(tag => {
                return tag.Key === "Name"
            }).Value.startsWith("mongodb")
        }).forEach(res => {
            let key = res.Instances[0].Tags.find(tag => {
                return tag.Key.toLowerCase() === 'index'
            }).Value
            dnsNames[key] = res.Instances[0].PublicDnsName
        });
        //console.log(dnsNames)
        //prepareCommands()
        //start()
    }
});

function start() {

    sequentialExecution(commands).then(() => {
        console.log('Command sequence terminated ok');
    }).catch((error) => {
        console.error(error)
    })

}

async function sequentialExecution(commands) {

    if (commands.length === 0) {
        return 0;
    }
    let cmd = commands.shift()
    try {
        await cmd.exec()
    } catch (error) {
        console.error(error);
        throw 'Command sequence aborted'
    }

    return sequentialExecution(commands);
}

function command(func) {
    this.exec = func
}

function parse(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;
    return str.replace(/%s/g, () => args[i++]);
}