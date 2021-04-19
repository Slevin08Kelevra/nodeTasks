let basics = {
    
'release.my.information': async (ws)=>{
        if (ws){
           ws.send('activate perro')
        }
        return ['tesing web socket']
    }

}

module.exports = basics;