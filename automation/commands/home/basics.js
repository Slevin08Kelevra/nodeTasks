const shell = require('shelljs');
const udpTransceiver = require('./../../udpTransceiver')
const udpt = udpTransceiver(8284, 8285, 8286)
const gralUtils = require('./../../gralUtils');

let home = {

    'unlock.the.gate': async ()=> {
        return ['gate unlocked(vc-vib:2)']
    },
    'ventilation.start': async ()=>{
        return ['ventilation start']
    },
    'switch.status': async ()=>{
        let message = await udpt.sendWithRetry("SWITCH_STATUS")
        return [message]
    },
    'smelly.cat.start': async ()=>{
        let message = await udpt.sendWithRetry("SWITCH_1_ON")
        return [message]
        //return ['ventilation start']
    },
    'smelly.cat.stop': async ()=>{
        let message = await udpt.sendWithRetry("SWITCH_1_OFF")
        return [message]
        //return ['ventilation start']
    },
    'are.you.ok': async (wsConns)=>{
        return await execute(wsConns, 'ruok')
    },
    'REGEX:ac.(?<arg0>[1-4]{1}).(?<arg1>on|off)': async (wsConns, allKeys, args)=>{
        let cmd
        let reg2 = args[1].toUpperCase()
        cmd = `SWITCH_${args[0]}_${reg2}`
        console.log(cmd)
        let message = await udpt.sendWithRetry(cmd)

        return ['got it ' + message]
    },
    'switch.status': async (wsConns, allKeys, args)=>{
        let message = await udpt.sendWithRetry("SWITCH_STATUS")
        return [message]
    },
    'backup.my.work': async (wsConns) =>{
        let message = ['Not ubuntu!']
        if (process.env.COMPUTER_NAME === 'UBUNTU'){
            message = [shell.exec('node backWritings.js').toString().trim()]
        } else {
            message = await execute(wsConns, 'bkupworks')
        }
        return message
    }
}

async function execute(wsConns, doWhat) {
    //do while expet gives forgiven
    let ret = ['not waiting something is wrong']
    if (!wsConns.get("UBUNTU")) {
        ret = ['web socket not connected!']
    } else {
        let { ws, obs } = wsConns.get("UBUNTU")
        let comProt = gralUtils.getComProt()
        comProt.data = doWhat
        ws.send(comProt.prepare())
        let message = ""
        try {
            message = await obs.expect()
        } catch (error) {
            message = error
        }

        ret = [message]
    }

    return ret
}

module.exports = home;