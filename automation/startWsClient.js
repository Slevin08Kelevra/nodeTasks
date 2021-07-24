const wsClient = require('./wsClient');
const gralUtils = require('./gralUtils')
const simpleGit = require('simple-git');
const fs = require('fs');


let gitDirArr = __dirname.split('\\')
gitDirArr.pop()
let gitDir = gitDirArr.join('\\')
gralUtils.logInfo('Git pull to ' + gitDir)
let git = simpleGit(gitDir);
git.pull((err, update) => {
    if(update && update.summary.changes) {
        setTimeout(() => {
            const time = new Date();
            const filename = __dirname + "\\restart.do"
  
            try {
              fs.utimesSync(filename, time, time);
            } catch (err) {
              fs.closeSync(fs.openSync(filename, 'w'));
            }
          }, 5000);
          gralUtils.logInfo('Git pull changes, restarting in 10 secs')
    } else {
        gralUtils.logInfo('Git with no changes, keep as if')
    }

    if (err){
        gralUtils.logError('Cant pull from git')
    }
  })

gralUtils.getGitProps((localhost, remotehost, status)=>{
    if (status == "wifi"){
        wsClient.start(localhost, status)
    } else {
        wsClient.start(remotehost, status)
    }
})
