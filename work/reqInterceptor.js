const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const httpProxy = require('http-proxy');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

/////////////////////////////////// PROXY SERVER ///////////////////////////////

const proxy = httpProxy.createProxyServer({secure: false});

// Restream parsed body before proxying
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  if(req.body) {
    let bodyData = JSON.stringify(req.body);
    // In case if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type','application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // Stream the content
    proxyReq.write(bodyData);
  }
});

const proxyApp = express();
proxyApp.use(bodyParser.json());
proxyApp.use(bodyParser.urlencoded({extended: true}));
proxyApp.use(function(req, res){
    
	//if (req.url === '/api/v0/components/products' && req.method === 'POST'){
    console.log("URL: " + req.url)
    console.log("METHOD: " + req.method)
	  console.log("BODY:" + JSON.stringify(req.body))
    //}
    
    proxy.on('proxyRes', function (proxyRes, req, res) {
      var body = [];
      proxyRes.on('data', function (chunk) {
          body.push(chunk);
      });
      proxyRes.on('end', function () {
          body = Buffer.concat(body).toString();
          console.log("**** RESPONSE FROM SERVER ****")
          console.log(body);
          console.log("**** END RESPONSE ****")
          //res.end("END RESPONSE");
      });
  });

    proxy.web(req, res, {
      //target: 'http://127.0.0.1:8080'
      target: 'https://inhas71165'
    })
  });

http.createServer(proxyApp).listen(9080, '0.0.0.0', () => {//8085
  console.log('Proxy server linsten on 8080');
});