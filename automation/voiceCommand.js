var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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

app.post('/send', async (req, res, next) => {

    let voiceCmd = req.body.message.toLowerCase()
    voiceCmd = voiceCmd.replace(/([0-9]+)/g, (number)=>{
        return toWords.convert(Number(number))
    })
    console.log(voiceCmd)


    let cmdToRun = 'phraseNotFound'
    Object.keys(phraseKeyMap).forEach(function (phrase) {
        var similarity = stringSimilarity.compareTwoStrings(phrase, voiceCmd);
        if (similarity > 0.80) {
            console.log(similarity);
            cmdToRun = phraseKeyMap[phrase]
        }
    });

    let response = {}
    response.status = await (commands[cmdToRun] || commands['phrase.not.found'])()

    res.json(response)
})

async function test() {
    console.log("async called")
}

var server = app.listen(8095, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})