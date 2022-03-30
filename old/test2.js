const axios = require('axios').default;

const express = require('express')
const path = require('path');
const app = express()
const port = 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var data1;

async function getData() {
      console.log("here");
      const firstRequest = await axios.get(`http://localhost/page1`);
      data1 = firstRequest.data;
      console.log("here2");
      if (data1){
          console.log(firstRequest.data);
        console.log("here3");
          const secondRequest = await axios.get(`http://localhost/page2`);
          console.log(secondRequest.data);
          data1 = secondRequest.data;
        console.log("here4");
      }
      console.log("here5");
      console.log (data1);
      return data1;
  }


getData();


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
