let basics = {

    'release.my.information': async (wsConns) => {
        let {ws, obs} = wsConns.get("BI_COMPUTER")
        let ret
        if (ws) {
            ws.send('activate perro')
            let message = "que mierda"
            try {
                message = await obs.expect()
            } catch (error) {
                message = error
            }
            
            ret = [message]
        } else {
            ret = ['web socket not connected!']
        }
        return ret
    }

}

module.exports = basics;