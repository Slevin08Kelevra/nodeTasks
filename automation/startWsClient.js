const cheerio = require('cheerio');
const request = require('request');
const wsClient = require('./wsClient');

request({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/Slevin08Kelevra/nodeTasks/props/props.html'
}, (err, res, body) => {

    if (err) return console.error(err);

    let $ = cheerio.load(body);

    let localhost = $('input[name=lh]').val();
    let remotehost = $('input[name=rh]').val();
    let status = $('input[name=st]').val();

    if (status == "wifi"){
        wsClient.start(localhost)
    } else {
        wsClient.start(remotehost)
    }

});
