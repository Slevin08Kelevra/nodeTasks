const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const commands = require('./commands/main.js');
const phraseKeyMap = commands.phraseKeyMap
const { ToWords } = require('to-words');
const stringSimilarity = require("string-similarity");

var privateKey  = fs.readFileSync(__dirname + '/certs/server.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/certs/server.crt', 'utf8');
var options = {
    key: privateKey,
    cert: certificate
};
var server = https.createServer(options, app)


const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: false,
      ignoreDecimal: true,
      ignoreZeroCurrency: true,
    }
  });

app.use(bodyParser.json());

var execEnabled = true
app.post('/send', async (req, res, next) => {

    let possibleCmds = req.body.possibleMessages
    let fixedCmds = possibleCmds.map((cmd)=>{
        let voiceCmd = cmd.toLowerCase()
        voiceCmd = voiceCmd.replace(/([0-9]+)/g, (number)=>{
            return toWords.convert(Number(number))
        })
        console.log(voiceCmd)
        return voiceCmd
    })
    

    
    let cmdToRun = ['phrase.not.found']
    let index = 0
    Object.keys(phraseKeyMap).forEach(function (phrase) {
        fixedCmds.some(voiceCmd => {
            var similarity = stringSimilarity.compareTwoStrings(phrase, voiceCmd);
            if (similarity > 0.85) {
                console.log(similarity);
                cmdToRun[index++] = phraseKeyMap[phrase]
                return true
            }
        })
    });

    if (cmdToRun.length > 1){
        console.log('repeated commands')
        cmdToRun.forEach((cmd)=>{
            console.log(cmd)
        })
        cmdToRun = ['general.phrase.repeated']
    }
    
    let response = {}
    if (execEnabled){
        execEnabled = false
        response.status = await (commands[cmdToRun[0]] || commands['general.phrase.not.found'])()
        delayAndEnableExec()
        if (cmdToRun[0]){
            response.appliedCmd = cmdToRun[0].replace(/\./g, ' ')
        } else {
            response.appliedCmd = 'General phrase not found'
        }
    } else {
        response.status = "repeated, repetition not allowed"
    }

    res.json(response)
})

async function delayAndEnableExec(){
    setTimeout(function(){
        execEnabled = true
    },5000);
};

async function test() {
    console.log("async called")
}

server.listen(8095, function () {

    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})