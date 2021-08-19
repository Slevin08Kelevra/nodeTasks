const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const httpProxy = require('http-proxy');

/////////////////////////////////// PROXY SERVER ///////////////////////////////

const proxy = httpProxy.createProxyServer({});

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
    
	if (req.url === '/api/v0/components/products' && req.method === 'POST'){
	  console.log(JSON.stringify(req.body))
    }
    
    proxy.web(req, res, {
      target: 'http://127.0.0.1:8080'
    })
  });

http.createServer(proxyApp).listen(8085, '0.0.0.0', () => {
  console.log('Proxy server linsten on 8080');
});