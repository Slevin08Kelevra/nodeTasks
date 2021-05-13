const schedule = require('node-schedule');
const { exec } = require('child_process');
const simpleGit = require('simple-git');
const git = simpleGit('/home/pablo/Documents/repos/nodeTasksPage/nodeTasks');
//const gralUtils = require("../gralUtils");
var fs = require('fs')



let retrying = false
let retries = 0

const job = schedule.scheduleJob('*/1 * * * *', function () {

    if (!retrying) {
        checkPhoneConnected()
    }

});


var phoneConnectedToWifi = false;

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
                if (phoneConnectedToWifi){
                    phoneConnectedToWifi = false
                    console.log(date_ob.getHours() + ":" + date_ob.getMinutes() + " phone disconnected!")
                    writeFileFromTemplate("pepe", "ipUbuntu", "awsIp")
                } 
            }

        } else {
            retrying = false
            retries = 0
            if (!phoneConnectedToWifi){
                phoneConnectedToWifi = true
                console.log(date_ob.getHours() + ":" + date_ob.getMinutes() + " OK")
                writeFileFromTemplate("wifi", "ipUbuntu", "awsIp")
            }
            
        }

    });

}

function writeFileFromTemplate(status, wifi, pepe){
    let someFile = "/home/pablo/Documents/repos/nodeTasks/automation/templates/propsPageTemplate.txt"
    let destFile = "/home/pablo/Documents/repos/nodeTasksPage/nodeTasks/index.md"
    fs.readFile(someFile, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.replace(/VALUE_RH/g, pepe);
        result = result.replace(/VALUE_LH/g, wifi);
        result = result.replace(/VALUE_ST/g, status);
      
        fs.writeFile(destFile, result, 'utf8', function (err) {
           if (err) return console.log(err);
           git.add('./index.md').commit("Changing data!").push();
        });
      });
}