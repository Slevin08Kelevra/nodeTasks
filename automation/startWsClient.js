const wsClient = require('./wsClient');
const gralUtils = require('./gralUtils')

gralUtils.getGitProps((localhost, remotehost, status)=>{
    if (status == "wifi"){
        wsClient.start(localhost)
    } else {
        wsClient.start(remotehost)
    }
})
