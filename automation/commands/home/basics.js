
let home = {

    'unlock.the.gate': async ()=> {
        return ['gate unlocked']
    },
    'ventilation.start': async ()=>{
        return ['ventilation start']
    },
    'smelly.cat.start': async ()=>{
        return ['ventilation start']
    },
    'are.you.ok': async ()=>{
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