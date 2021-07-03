
const gralUtils = require('./../../gralUtils.js')

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
        let keysWithLinks = allKeys.map(x => x + `(vc-link:${x})`)
        return keysWithLinks
    },
    'restart.application': async (wsConns, allKeys)=>{

        let result = gralUtils.retartApp()

        return [result]
    }
}

module.exports = common;