var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const commands = require('./commands/main.js');
const phraseKeyMap = commands.phraseKeyMap

var stringSimilarity = require("string-similarity");

app.use(bodyParser.json());

app.post('/send', async (req, res, next) => {

    let voiceCmd = req.body.message.toLowerCase()
    console.log(voiceCmd)


    let cmdToRun
    Object.keys(phraseKeyMap).forEach(function (phrase) {
        var similarity = stringSimilarity.compareTwoStrings(phrase, voiceCmd);
        if (similarity > 0.75) {
            console.log(similarity);
            cmdToRun = phraseKeyMap[phrase]
        }
    });

    let response = {}
    response.status = await (commands[cmdToRun])()

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