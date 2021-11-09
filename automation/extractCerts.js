// with commonJS
const { Client } = require('node-scp')
const fs = require('fs');

const path = require('path');

const srcDir = '/home/pablo/Documents/repos/nodeTasks/automation/certs/justCreated';
const destDir = 'C:\\justCreated'
const keyDir = 'C:\\keys\\ubuntu'

fs.readdir(destDir, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(destDir, file), err => {
      if (err) throw err;
    });
  }
});

Client({
  host: '192.168.1.132',
  port: 22,
  username: 'pablo',
  privateKey: fs.readFileSync(keyDir),
}).then(client => {
  client.downloadDir(srcDir, destDir)
        .then(response => {
          client.close() 
        })
        .catch(error => {
            console.log(error)
        })
}).catch(e => console.log(e))