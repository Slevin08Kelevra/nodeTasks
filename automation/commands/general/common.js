
const gralUtils = require('./../../gralUtils.js')

let common = {

    'phrase.not.found': async () => {
        return ['not found']
    },
    'phrase.repated': async () => {
        return ['repeated command match']
    },
    'ping': async () => {
        return ['pong']
    },
    'what.can.i.do': async (wsConns, allKeys) => {
        let headers = allKeys.map(command => command.split(" ")[0]).reduce(groupBy, [])
        let hederWithLinks = headers.map(x => x + `(vc-link:general show next level ${x})`)
        return hederWithLinks
    },

    'REGEX:show.next.level.(?<arg0>[a-z]{2,})': async (wsConns, allKeys, args) => {
        let keysWithLinks = allKeys.filter(phrase => phrase.startsWith(args[0] + " "))
            .map(phrase => {
                if (!phrase.includes("REGEX")){
                    return phrase + `(vc-link:${phrase})`
                } else {
                    return phrase
                }
            } )
        keysWithLinks.unshift("<- Go back(vc-link:general what can i do)")
        return keysWithLinks
    },
    'restart.application': async (wsConns, allKeys) => {

        let result = gralUtils.retartApp(3)

        return [result]
    }
}

const groupBy = (array, val) => {
    if (array.indexOf(val) == -1) {
        array.push(val)
    }
    return array;
};


module.exports = common;