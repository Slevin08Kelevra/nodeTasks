let basics = {

    'release.my.information': async (wsConns) => {
        let ret = ['not waiting something is wrong']
        if (!wsConns.get("BI_COMPUTER")) {
            ret = ['web socket not connected!']
        } else {
            let { ws, obs } = wsConns.get("BI_COMPUTER")
            ws.send('showMyInf')
            let message = ""
            try {
                message = await obs.expect()
            } catch (error) {
                message = error
            }
    
            ret = [message]
        }
        
        return ret
    },
    'unlock': async (wsConns) => {
        let ret = ['not waiting something is wrong']
        if (!wsConns.get("BI_COMPUTER")) {
            ret = ['web socket not connected!']
        } else {
            let { ws, obs } = wsConns.get("BI_COMPUTER")
            ws.send('unlock')
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

}

module.exports = basics;