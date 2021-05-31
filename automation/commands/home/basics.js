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