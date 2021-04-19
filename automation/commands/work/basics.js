let basics = {

    'release.my.information': async (wsConns) => {
        let ws = wsConns.get("BI_COMPUTER")
        let ret
        if (ws) {
            ws.send('activate perro')
            ret = ['tesing web socket']
        } else {
            ret = ['web socket not connected!']
        }
        return ret
    }

}

module.exports = basics;