const fs = require('fs');
const digitGenerator = require('crypto-secure-random-digit');

const android = "/home/pablo/Documents/repos/speech/app/src/main/java/com/pcordoba/speechtotexttest1/SignUtilTest.java"
const nodejs = "/home/pablo/Documents/repos/nodeTasks/automation/reqValidatorAux.js"

let randomDigits = digitGenerator.randomDigits(600);

let newGeneratedAndroid = ""
for (let i = 0; i < randomDigits.length; i++) {
    const number = randomDigits[i];
    const realPos = i + 1
    const prevPos = i
    if (i == 0 || prevPos % 30 === 0) {
        newGeneratedAndroid += "\n            {"
    }
    newGeneratedAndroid += number
    if (realPos % 6 === 0 && realPos % 30 !== 0) {
        newGeneratedAndroid += "}, {"
    } else if (realPos % 30 === 0 && realPos !== 600) {
        newGeneratedAndroid += "},"
    } else if (realPos === 600) {
        newGeneratedAndroid += "}\n            "
    } else {
        newGeneratedAndroid += ", "
    }
}

let newGeneratedNode = ""
for (let i = 0; i < randomDigits.length; i++) {
    const number = randomDigits[i];
    const realPos = i + 1
    const prevPos = i
    if (i == 0 || prevPos % 30 === 0) {
        newGeneratedNode += "\n    ["
    }
    newGeneratedNode += number
    if (realPos % 6 === 0 && realPos % 30 !== 0) {
        newGeneratedNode += "], ["
    } else if (realPos % 30 === 0 && realPos !== 600) {
        newGeneratedNode += "],"
    } else if (realPos === 600) {
        newGeneratedNode += "]\n    "
    } else {
        newGeneratedNode += ", "
    }
}

function readWriteSync() {

    var dataAndroid = fs.readFileSync(android, 'utf-8');
    var newDataAndroid = dataAndroid
        .replace(/\/\/STRATEGY_START[\s\S]+\/\/STRATEGY_END/, `//STRATEGY_START${newGeneratedAndroid}//STRATEGY_END`);
    fs.writeFileSync(android, newDataAndroid, 'utf-8');

    var dataNode = fs.readFileSync(nodejs, 'utf-8');
    var newDataNode = dataNode
        .replace(/\/\/STRATEGY_START[\s\S]+\/\/STRATEGY_END/, `//STRATEGY_START${newGeneratedNode}//STRATEGY_END`);
    fs.writeFileSync(nodejs, newDataNode, 'utf-8');


    console.log('readFileSync complete');
}


readWriteSync();