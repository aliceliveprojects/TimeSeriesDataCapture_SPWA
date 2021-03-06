const express = require('express');
const http = require('http')
const path = require('path');
var fs = require('fs');


var getClientConfig = function () {
  var result = {};


  if(!process.env.BROWSEAPI_URI) throw new Error("undefined in environment: BROWSEAPI_URI");

  if(!process.env.ONEDRIVE_CLIENTID) throw new Error("undefined in environment: ONEDRIVE_CLIENTID");
  if(!process.env.ONEDRIVE_REDIRECTURI) throw new Error("undefined in environment: ONEDRIVE_REDIRECTURI");
  if(!process.env.ONEDRIVE_SCOPES) throw new Error("undefined in environment: ONEDRIVE_SCOPES");
  if(!process.env.ONEDRIVE_AUTHSERVICEURI) throw new Error("undefined in environment: ONEDRIVE_AUTHSERVICEURI");

  if(!process.env.AUTH0_DOMAIN) throw new Error("undefined in environment: AUTH0_DOMAIN");
  if(!process.env.AUTH0_CLIENTID) throw new Error("undefined in environment: AUTH0_CLIENTID");
  if(!process.env.AUTH0_REDIRECT_URI) throw new Error("undefined in environment: AUTH0_REDIRECT_URI");

  


  if(!process.env.DEFAULT_COLUMN) process.env.DEFAULT_COLUMN = '';
  
  result.BROWSEAPI_URI = process.env.BROWSEAPI_URI;

  result.ONEDRIVE_CLIENTID = process.env.ONEDRIVE_CLIENTID;
  result.ONEDRIVE_REDIRECTURI = process.env.ONEDRIVE_REDIRECTURI;
  result.ONEDRIVE_SCOPES = process.env.ONEDRIVE_SCOPES;
  result.ONEDRIVE_AUTHSERVICEURI = process.env.ONEDRIVE_AUTHSERVICEURI;

  result.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
  result.AUTH0_CLIENTID = process.env.AUTH0_CLIENTID;
  result.AUTH0_REDIRECT_URI = process.env.AUTH0_REDIRECT_URI;

  result.DEFAULT_COLUMN = process.env.DEFAULT_COLUMN;

  return result;
}

var writeClientConfig = function(config){
  fs.writeFileSync('./configDetailsConstant.js',`var CONFIG = ${JSON.stringify(config)}`);
}

writeClientConfig(getClientConfig());


const app = express();

app.use(express.static(path.join(__dirname, '')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const port = process.env.PORT || 8080;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`running on port ${port}`));


