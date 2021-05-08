let basics = {

    'release.my.information': async (wsConns) => {

        return await execute(wsConns, 'showMyInf')

    },
    'unlock': async (wsConns) => {

        return await execute(wsConns, 'unlock')
f
    }

}

async function execute(wsConns, doWhat) {
    //do while expet gives forgiven
    let ret = ['not waiting something is wrong']
    if (!wsConns.get("BI_COMPUTER")) {
        ret = ['web socket not connected!']
    } else {
        let { ws, obs } = wsConns.get("BI_COMPUTER")
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


module.exports = basics;