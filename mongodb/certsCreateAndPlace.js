const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const fs = require('fs')
const yaml = require('js-yaml');

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

// Get document, or throw exception on error
var props
try {
    props = yaml.load(fs.readFileSync('commandProps.yaml', 'utf8'));
} catch (e) {
    console.log(e);
    process.exit(1)
}

let commands = []

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
                argsCloned.name = argsCloned.name.replace(/%i/g, index)
                console.log(argsCloned.cmd)
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

sequentialExecution(commands).then(() => {
    console.log('Command sequence terminated ok');
}).catch((error) => {
    console.error(error)
})

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