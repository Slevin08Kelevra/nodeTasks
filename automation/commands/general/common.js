

let common = {

    'phrase.not.found': async ()=> {
        return ['not found']
    },
    'phrase.repated': async ()=>{
        return ['repeated command match']
    },
    'web.socket.test': async (ws)=>{
        if (ws){
           ws.send('activate perro')
        }
        return ['tesing web socket']
    }

}

module.exports = common;