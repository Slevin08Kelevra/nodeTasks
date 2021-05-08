const schedule = require('node-schedule');
const { exec } = require('child_process');


let retrying = false
let retries = 0

const job = schedule.scheduleJob('*/2 * * * *', function () {

    if (!retrying) {
        checkPhoneConnected()
    }



});


function checkPhoneConnected() {

    let date_ob = new Date();
    let cmd = 'sudo nmap -sP 192.168.1.1/24 | awk \'/88:9E:33:7E:58:7D/{print $3}\''
    retries++
    exec(cmd, (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(`exec error: ${error}`);
            return;
        }
        if (stdout.trim() != "88:9E:33:7E:58:7D") {
            retrying = true
            if (retries <= 3) {
                setTimeout(() => {
                    checkPhoneConnected()
                }, 10000);
            } else {
                retrying = false
                retries = 0
                console.log(date_ob.getHours() + ":" + date_ob.getMinutes() + " phone disconnected!")
            }

        } else {
            retrying = false
            retries = 0
            console.log(date_ob.getHours() + ":" + date_ob.getMinutes() + " OK")
        }

    });

}