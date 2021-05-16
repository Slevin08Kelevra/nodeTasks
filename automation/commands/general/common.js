

let common = {

    'phrase.not.found': async ()=> {
        return ['not found']
    },
    'phrase.repated': async ()=>{
        return ['repeated command match']
    },
    'ping': async ()=>{
        return ['pong']
    }
}

module.exports = common;