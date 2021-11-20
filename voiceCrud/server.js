// call the packages we need
//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database(':memory:')
//var db = new sqlite3.Database('sqlite.db');
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
var net = require('net');
const { exec } = require('child_process');
const validator = require("./../automation/reqValidator")

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8096;        // set our port
var router = express.Router();
app.use('/api', router);
app.listen(port);
app.set('views', __dirname + '/views');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var funcs = []
funcs.letMeIn = () => {
  console.log('let me in, executing')
  process.chdir('./../automation');
  let clau = validator.getClau()
  exec(`node unlock.js ${clau}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
  }); 
}
funcs.workWindows = () => {
  console.log('openning work windows, executing')
}



router.get('/', function (req, res) {
  res.render('index.html');
});


/**
  * Find and retrieves all items
  * @param {Object} req HTTP request object.
  * @param {Object} res HTTP response object.
  */
listAll = function (req, res) {
  console.log("GET - /listAll");
  return res.send({ error: 'Server error' });

};

getInstructions = function (req, res) {
  console.log("GET - /getInstructions");


  //db.all("SELECT * FROM instructions", function(err, rows) {  

  //console.log(rows);
  //res.send([{"email":rows[0].inst, "password": "123456", "username": "user"},
  //     {"email": "JK Rowling", "password": "234567", "username": "another user"}]);

  //res.send(rows);

  //rows.forEach(function (row) {  
  //    console.log(rows);  
  //})  
  //});   
  //db.close();   
};

recordOn = function (req, res) {

  console.log("GET - /voiceRecord/on");
  var response = "";



  return res.send({ status: 'recording' });

};

recordOff = function (req, res) {

  console.log("GET - /voiceRecord/0ff");
  return res.send({ status: 'stoped' });

};

saveInstruction = function (req, res) {
  console.log("POST - /saveInstruction");

  var jsonData = JSON.parse(req.body.data);

  var stmt = db.prepare("INSERT INTO instructions(inst,desc,sim) VALUES (?,?,?)");
  //db.run("INSERT into instructions(inst,desc,sim) VALUES ('pepe','ganga','1')");
  stmt.run(jsonData.inst, jsonData.desc, jsonData.sim);

};

updateInstruction = function (req, res) {
  console.log("PUT - /updateInstruction");

  var jsonData = JSON.parse(req.body.data);
  var stmt = db.prepare("UPDATE instructions SET inst=?, desc=?, sim=? WHERE id = ?");
  stmt.run(jsonData.inst, jsonData.desc, jsonData.sim, jsonData.id);

};

updateInstruction = function (req, res) {
  console.log("PUT - /updateInstruction");

  var jsonData = JSON.parse(req.body.data);
  var stmt = db.prepare("UPDATE instructions SET inst=?, desc=?, sim=? WHERE id = ?");
  stmt.run(jsonData.inst, jsonData.desc, jsonData.sim, jsonData.id);

};

deleteInstruction = function (req, res) {
  console.log("DELETE - /deleteInstruction");

  var jsonData = JSON.parse(req.body.data);
  var stmt = db.prepare("DELETE FROM instructions WHERE id = ?");
  stmt.run(jsonData.id);

};

//Link routes and actions
router.get('/listAll', listAll);
router.get('/getInstructions', getInstructions);
router.get('/voiceRecord/on', recordOn);
router.get('/voiceRecord/off', recordOff);

router.post('/saveInstruction', saveInstruction);
router.put('/updateInstruction', updateInstruction);
router.delete('/deleteInstruction', deleteInstruction);

router.post('/doSomething', (req, res) => {

  let fn = req.body.do
  if (fn in funcs && typeof funcs[fn] === "function") {
    funcs[fn]();
  }
  return res.send({ status: 'EXECUTED' });
})


function socketClient() {

  var client = new net.Socket();
  client.connect(9095, 'localhost', function () {
    console.log('Connected');
    client.write("RECON");
    client.end();
  });

  client.on('data', function (data) {
    console.log('Received: ' + data);
    response = data;
    client.destroy(); // kill client after server's response
  });

  client.on('close', function () {
    console.log('Connection closed');
  });

  client.on('error', function (ex) {
    console.log("handled error");
    console.log(ex);
  });

}
