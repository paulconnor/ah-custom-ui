const express = require('express')
const path = require('path');
const app = express()


var port = process.env.PORT ||  8080


/*
 * Content Management system content
 */

app.get('/otp.html', (req, res) => {
  console.log("Sending OTP Form");
  res.sendFile(path.join(__dirname, '/otp.html'));
})

app.listen(port, () => {
  console.log(`Example CMS listening on port ${port}`)
})
