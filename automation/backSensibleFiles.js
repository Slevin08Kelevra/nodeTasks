const zl = require("zip-lib");
const zip = new zl.Zip();
const fs = require('fs');

if (fs.existsSync("/home/pablo/Documents/repos/sensibleBack/back.zip")) {
    fs.unlinkSync("/home/pablo/Documents/repos/sensibleBack/back.zip");
}

if (fs.existsSync("/home/pablo/Documents/repos/sensibleBack/back.kript.zip")) {
    fs.unlinkSync("/home/pablo/Documents/repos/sensibleBack/back.kript.zip");
}



zip.addFile("/home/pablo/Documents/repos/nodeTasks/automation/reqValidator.js");
zip.addFile("/home/pablo/Documents/repos/speech/app/src/main/java/com/pcordoba/speechtotexttest1/SignUtil.java");
zip.addFile("/home/pablo/Documents/repos/nodeTasks/automation/Automation.postman_collection.json");
//zip.addFolder("path/to/folder");

zip.archive("/home/pablo/Documents/repos/sensibleBack/back.zip").then(function () {
    fs.copyFile('/home/pablo/Documents/repos/sensibleBack/back.zip', '/home/pablo/Dropbox/tasVids/back.zip', (err) => {
        if (err) throw err;
        console.log("done");
      });
}, function (err) {
    console.log(err);
});

//zip --encrypt back.kript.zip back.zip
// /home/pablo/Dropbox/tasVids