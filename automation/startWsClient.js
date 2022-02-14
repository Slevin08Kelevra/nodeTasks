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
    if (err) {
        gralUtils.logError('Cant pull from git')
        doStart()
    } else if (update && update.summary.changes) {
        const time = new Date();
        const filename = __dirname + "\\restart.do"

        try {
            fs.utimesSync(filename, time, time);
        } catch (err) {
            fs.closeSync(fs.openSync(filename, 'w'));
            gralUtils.logError('Cant modify restart.do')
        }

        gralUtils.logInfo('Git pull changes, restarting app now.')
    } else {
        gralUtils.logInfo('Git with no changes, keep as if.')
        doStart()
    }

})

function doStart() {
    gralUtils.getGitProps((localhost, remotehost, status) => {
        if (status == "wifi") {
            wsClient.start(localhost, status)
        } else {
            wsClient.start(remotehost, status)
        }
    })
}
