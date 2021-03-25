const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const commands = require('./commands/main.js');
const phraseKeyMap = commands.phraseKeyMap
const { ToWords } = require('to-words');
const stringSimilarity = require("string-similarity");

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

    let voiceCmd = req.body.message.toLowerCase()
    voiceCmd = voiceCmd.replace(/([0-9]+)/g, (number)=>{
        return toWords.convert(Number(number))
    })
    console.log(voiceCmd)

    
    let cmdToRun = 'phraseNotFound'
    Object.keys(phraseKeyMap).forEach(function (phrase) {
        var similarity = stringSimilarity.compareTwoStrings(phrase, voiceCmd);
        if (similarity > 0.85) {
            console.log(similarity);
            cmdToRun = phraseKeyMap[phrase]
        }
    });
    
    let response = {}
    if (execEnabled){
        execEnabled = false
        response.status = await (commands[cmdToRun] || commands['phrase.not.found'])()
        delayAndEnableExec()
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

var server = app.listen(8095, function () {

    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})