const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const fs = require('fs')
const yaml = require('js-yaml');
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
var ec2 = new AWS.EC2({region: 'us-east-2'});
var dnsNames

var funcs = []

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

function prepareCommands(){
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
                    argsCloned.cmd = argsCloned.cmd.replace(/%POD_NAME/g, dnsNames[index-1])
                    argsCloned.name = argsCloned.name.replace(/%i/g, index)
                    commands.push(funcs[fn](argsCloned))
                }
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
        dnsNames = data.Reservations.filter( res => {
            return res.Instances[0].Tags[0].Value.startsWith("mongodb")
        }).map(res => { 
            return res.Instances[0].PublicDnsName
        });
        prepareCommands()
        start()
    }
});

function start(){

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