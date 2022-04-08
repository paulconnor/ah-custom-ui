const express = require('express')
const path = require('path');
const app = express()
const port = 80

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var querystring = require('querystring');
var https = require('https');
var fs = require('fs');

var gAccessToken = "";
var gFlowState = "";
var gCredId = "";

var gCMSURL = process.env.CMSURL ||  "http://35.189.9.205:8080/otp.html"
var gClientId = process.env.CLIENTID ; 
var gClientSecret = process.env.CLIENTSECRET ;
var gSspHost = process.env.SSPHOST  ;


function sspAuthenticate(otpRes) {

   if (gAccessToken.length == 0) {
      console.log ("Waiting for AT");
      setTimeout(function() { sspAuthenticate(otpRes); } ,300);
   } else { 

      var data = JSON.stringify({
    	   action: "authenticate",
    	   ipAddress: "1.1.1.2",
    	   channel: "web"
      });
   
   
      var post_options = {
         host: gSspHost ,
         port: '443',
         path: '/default/auth/v1/authenticate',
         method: 'POST',
         headers: {
             'Authorization': 'Bearer ' + gAccessToken ,
             'Content-Type': 'application/json',
             'User-Agent': 'authHub-custom-otp-ui',
             'x-flow-state': gFlowState,
             'Content-Length': Buffer.byteLength(data)
            }
      };

      var post_req = https.request(post_options, function(res) {
         res.setEncoding('utf8');
         res.on('data', function (chunk) {
             var obj = JSON.parse(chunk);
             gFlowState = obj.flowState;;
             if (obj.nextaction == "FACTOR_SELECTION")
             {
                //for (var i=0; i<obj.currentFactors.length;i++){
                for (const factor of obj.currentFactors) {
                   if (factor=="SMSOTP") {
                      console.log("Call Selected Factor = SMSOTP");
		      sspAuthSMS(otpRes);
                      break;
                   }
                   if (factor=="EMAILOTP") {
                      console.log("Call Selected Factor = EMAILOTP");
                      break;
                   }
                }
             } else {
                console.log("ERROR - INVALID FLOW STATE" + obj.nextaction);
             }
     
         });
      });

     // post the data
     post_req.write(data);
     post_req.end();
   }
}



function sspAuthSMS(otpRes) {

      var data = JSON.stringify({
    	   factor: "SMSOTP"
      });
   
      var post_options = {
         host: gSspHost ,
         port: '443',
         path: '/default/auth/v1/SelectedFactor',
         method: 'POST',
         headers: {
             'Authorization': 'Bearer ' + gAccessToken ,
             'Content-Type': 'application/json',
             'User-Agent': 'authHub-custom-otp-ui',
             'x-flow-state': gFlowState,
             'Content-Length': Buffer.byteLength(data)
            }
      };

      var post_req = https.request(post_options, function(res) {
         res.setEncoding('utf8');
         res.on('data', function (chunk) {
             var obj = JSON.parse(chunk);
             gFlowState = obj.flowState;;
             sspSendSMS(otpRes,obj.credentials[0].credId);
         });
      });

     // post the data
     post_req.write(data);
     post_req.end();

}


function sspSendSMS(otpRes,smsCredId) {

   console.log("Sending SMS for " + smsCredId);

      var data = JSON.stringify({
           action: "Login",
           credId: smsCredId,
           credType: "SMS",
           language: "en_US"
      });

      var post_options = {
         host: gSspHost ,
         port: '443',
         path: '/default/factor/v1/OTPGenerator',
         method: 'POST',
         headers: {
             'Authorization': 'Bearer ' + gAccessToken ,
             'Content-Type': 'application/json',
             'User-Agent': 'authHub-custom-otp-ui',
             'x-flow-state': gFlowState,
             'Content-Length': Buffer.byteLength(data)
            }
      };

      var post_req = https.request(post_options, function(res) {
         res.setEncoding('utf8');
         res.on('data', function (chunk) {
             var obj = JSON.parse(chunk);
             gFlowState = obj.flowState;;
             gCredId = smsCredId;
             console.log("Redirect to CMS");
             otpRes.redirect(gCMSURL+"?credId="+smsCredId);
         });
      });

     // post the data
     post_req.write(data);
     post_req.end();

}


function sspVerifySMS(otpRes,smsCredId,otpValue) {

  console.log("Verify SMS " + otpValue + " for " + smsCredId);

      var data = JSON.stringify({
           credId: smsCredId,
           otp: otpValue
      });

      var post_options = {
         host: gSspHost ,
         port: '443',
         path: '/default/factor/v1/OTPVerifier',
         method: 'POST',
         headers: {
             'Authorization': 'Bearer ' + gAccessToken ,
             'Content-Type': 'application/json',
             'User-Agent': 'authHub-custom-otp-ui',
             'x-flow-state': gFlowState,
             'Content-Length': Buffer.byteLength(data)
            }
      };

      var post_req = https.request(post_options, function(res) {
         res.setEncoding('utf8');
         res.on('data', function (chunk) {
             var obj = JSON.parse(chunk);
             if (obj.nextaction  =='AUTH_ALLOWED') {
                var redirect = obj.authCompleteUrl;
                otpRes.redirect(redirect);
             }
         });
      });

     // post the data
     post_req.write(data);
     post_req.end();

}


function getToken(otpRes) {

   var post_data = querystring.stringify({
      'grant_type' : 'client_credentials',
      'scope' : 'urn:iam:myscopes'
  });

  var post_options = {
      host: gSspHost ,
      port: '443',
      path: '/default/oauth2/v1/token',
      method: 'POST',
      headers: {
          'Authorization': 'Basic ' + new Buffer(gClientId + ':' + gClientSecret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          var obj = JSON.parse(chunk);
          if (obj.hasOwnProperty('access_token')) { 
             gAccessToken = obj.access_token;
             sspAuthenticate(otpRes);
          } else {
             console.log ("ERROR - failed to get access token for client")
          }
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}

app.get('/page1', (req, res) => {
  res.send('Hello World ONE!')
})

app.get('/page2', (req, res) => {
  res.send('Hello World TWO!')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/login', (req, res) => {
  gFlowState = req.query["x-flow-state"];
  getToken(res);
})


app.get('/credentials', (req, res) => {
   if (req.query.hasOwnProperty('clientId')) { 
      gClientId = req.query.clientId ;
   } else {
      console.log ("Client ID not received")
   }
   if (req.query.hasOwnProperty('clientSecret')) { 
      gClientSecret = req.query.clientSecret ;
   } else {
      console.log ("Client Secret not received")
   }
   console.log ( "client credentials updated : " + req.query.clientId + " / " + req.query.clientSecret);
   res.send ( "client credentials updated : " + req.query.clientId + " / " + req.query.clientSecret + "\n");
})

app.post('/otp.html', (req, res) => {
  var smsCredId = req.body.CREDID;
  var otpValue = req.body.OTP;
  sspVerifySMS(res,smsCredId,otpValue);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
