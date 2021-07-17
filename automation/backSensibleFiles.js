const zl = require("zip-lib");
const zip = new zl.Zip();
const fs = require('fs');
const spawn = require('child_process').spawn;

if (fs.existsSync("/home/pablo/Documents/repos/sensibleBack/back.zip")) {
    fs.unlinkSync("/home/pablo/Documents/repos/sensibleBack/back.zip");
}

if (fs.existsSync("/home/pablo/Documents/repos/sensibleBack/back.kript.zip")) {
    fs.unlinkSync("/home/pablo/Documents/repos/sensibleBack/back.kript.zip");
}



zip.addFile("/home/pablo/Documents/repos/nodeTasks/automation/reqValidator.js");
zip.addFile("/home/pablo/Documents/repos/nodeTasks/automation/certDoc.txt");
zip.addFile("/home/pablo/Documents/repos/speech/app/src/main/java/com/pcordoba/speechtotexttest1/SignUtil.java");
zip.addFile("/home/pablo/Documents/repos/nodeTasks/automation/Automation.postman_collection.json");
//zip.addFolder("path/to/folder");

zip.archive("/home/pablo/Documents/repos/sensibleBack/back.zip").then(function () {
    let zip = spawn('zip', ['--password', '1234qwer', '/home/pablo/Documents/repos/sensibleBack/back.kript.zip', '/home/pablo/Documents/repos/sensibleBack/back.zip']);

    zip.on('exit', function (code) {
        fs.copyFile('/home/pablo/Documents/repos/sensibleBack/back.kript.zip', '/home/pablo/Dropbox/tasVids/back.kript.zip', (err) => {
            if (err) throw err;
            console.log("done");
        });
    });


}, function (err) {
    console.log(err);
});

//zip --encrypt back.kript.zip back.zip
// /home/pablo/Dropbox/tasVids