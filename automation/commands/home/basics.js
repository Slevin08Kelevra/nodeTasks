const udpTransceiver = require('./../../udpTransceiver')
const udpt = udpTransceiver(8284, 8285, 8286)

let home = {

    'unlock.the.gate': async ()=> {
        return ['gate unlocked']
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
    'REGEX:ac.(?<arg1>[1-4]{1}).(?<arg2>on|off)': async (wsConns, allKeys, args)=>{
        let cmd
        let reg2 = args.regex_2.toUpperCase()
        cmd = `SWITCH_${args.regex_1}_${reg2}`
        let message = await udpt.sendWithRetry(cmd)

        return ['got it ' + message]
    }
}

async function execute(wsConns, doWhat) {
    //do while expet gives forgiven
    let ret = ['not waiting something is wrong']
    if (!wsConns.get("UBUNTU")) {
        ret = ['web socket not connected!']
    } else {
        let { ws, obs } = wsConns.get("UBUNTU")
        ws.send(doWhat)
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