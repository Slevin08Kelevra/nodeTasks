const dgram = require('dgram');

const udpTransceiver = (serverPort, clientPort, destPort) => {
    const server = dgram.createSocket('udp4');
    const client = dgram.createSocket('udp4');
    let obs = respObserver(1000, "udp tiemout")
    server.bind(serverPort);
    client.bind(clientPort, function () { client.setBroadcast(true) });
    server.on('listening', function () {
        var address = server.address();
        console.log("UDP Server listening on localhost:" + address.port);
    });
    server.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);
        obs.redirect(Buffer.from(message, 'utf8').toString())
    });
    let retries = 0

    async function transceive (message) {
        let respMsg = "NO RESPONSE"
        obs = respObserver(1000, "Error waiting upd response")
        setTimeout(() => {
            client.send(message, destPort, '192.168.1.255', (err) => {
                if (err){
                    console.log("Error sending udp message: " + message)
                }
            });
        }, 150);
  
        try {
            retries++
            respMsg = await obs.expect()
            retries = 0
        } catch (error) {           
            if (retries > 3){
               console.log(error)
               retries = 0
            } else {
                respMsg = await transceive(message)
            }
        }
        
        return respMsg
    }

    return {
        sendWithRetry: async (message) => {
            return await transceive(message)
        }
    }
}

const respObserver = (timeout, errMessage) => {
    return {
        res: null, 
        redirect: (message) => {
           res(message)
        },
        expect: async () => {
            let timeOutProm =  new Promise((resolve, reject) => {
                setTimeout( () => { reject(errMessage); }, timeout);
            })
            let messageProm = new Promise((resolve, reject) => {
                res = resolve
            })
            return Promise.race([ 
                messageProm, 
                timeOutProm, 
              ])
        }
    }
}


module.exports = udpTransceiver;