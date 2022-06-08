/* Importation des librairies */
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const axios = require('axios');
const port = 7778; 

/* Fonctions */
function DateFormated(){
  var dateNow = new Date();
  var dd = dateNow.getDate();
  var monthSingleDigit = dateNow.getMonth() + 1,
  mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
  var yy = dateNow.getFullYear().toString().substr(2);
  var formattedDate = mm + '/' + dd + '/' + yy;
  return formattedDate;
}

function RequestHttps(Url_End, res){
  const Url = "http://" + Url_End;
  console.log("\n#- Date: "+DateFormated()+", Request:");
  console.log("#-- "+Url);

  axios.get(Url)
  .then(response => {
    console.log("#--- Data: "+response.data);
    res.send( response.data);
  })
  .catch(error => {
    console.log(error);
  });
}

function ChangeServerAndPort(Url){
  const full_db = require('../API-Gaia/database.json');
  const db = full_db["server"];

  var TargetDomaine = Url.split("/")[0].split(":");

  if(TargetDomaine[0] == db["names"]["public"] && TargetDomaine[1] == db["ports"]["HTTPStoHTTP"]["externe"]){
    TargetDomaine[0] = "localhost";
    TargetDomaine[1] =  db["ports"]["HTTPStoHTTP"]["interne"];
  }
  else if(TargetDomaine[0] == db["names"]["local"]){
    TargetDomaine[0] = "localhost";
  }
  
  TargetDomaine[1] = port.toString();
  return (TargetDomaine[0] +":"+ TargetDomaine[1]);
}

function FormatUrl(MarkUrl){
  var RichUrl = MarkUrl;
  while(RichUrl.includes('$') || RichUrl.includes('£')){
    RichUrl = RichUrl.replace('$', '/');
    RichUrl = RichUrl.replace('£', '?');
  }
  return (RichUrl);
}


/* On créer notre application Express */
const app = express();

/* On récupère notre clé privée et notre certificat (ici ils se trouvent dans le dossier certificate) */
const key = fs.readFileSync(path.join(__dirname, 'certificate', 'server.key'));
const cert = fs.readFileSync(path.join(__dirname, 'certificate', 'server.cert'));
const options = { key, cert };

app.get('/redirect/:request', (req, res) => {
  RequestHttps(ChangeServerAndPort(FormatUrl(req.params.request), res));
});

/* Puis on créer notre serveur HTTPS */
https.createServer(options, app).listen(port, () => {
  console.log('#- Server HTTPS-HTTP Repeater started ! It listening on port ' + port);
});

