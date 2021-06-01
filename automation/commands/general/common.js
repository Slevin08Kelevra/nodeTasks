

let common = {

    'phrase.not.found': async ()=> {
        return ['not found']
    },
    'phrase.repated': async ()=>{
        return ['repeated command match']
    },
    'ping': async ()=>{
        return ['pong']
    },
    'what.can.i.do': async (wsConns, allKeys)=>{
        return allKeys
    }
}

module.exports = common;