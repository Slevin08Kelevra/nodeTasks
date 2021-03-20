const path = require("path")
const fs = require("fs");

let myPath = path.join(__dirname, "");
let base = {};
base.phraseKeyMap = {}
fs.readdirSync(myPath).forEach(function (folder) {
    let subDir = path.resolve(myPath, folder)
    if (fs.statSync(subDir).isDirectory()) {
        fs.readdirSync(subDir).forEach(function (cmdFile) {
            if (cmdFile.endsWith(".js")) {
                let jsfile = path.resolve(subDir, cmdFile)
                let strat = require(jsfile);
                base = extend(base, strat, folder);
            }
        })
    }

});

function extend(obj, src, folder) {
    
    Object.keys(src).forEach(function (key) { 
        let spreadKey = key.replace(/\./g, ' ')
        base.phraseKeyMap[`${folder} ${spreadKey}`] = key
        obj[key] = src[key]; 
    });
    return obj;
}

module.exports = base;