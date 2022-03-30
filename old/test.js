const http = require('http')

async function get_page(url) {
var data = "";
    return new Promise((resolve) => {
        http.get(url, res => {

            res.on('data', chunk => { data += chunk }) 

            res.on('end', () => {

               resolve(use_data(data));

            })
        }) 
    })
}

function use_data(data) {
   console.log (data);
}

// usage
console.log ("step1");
(async () => await get_page("http://localhost/page1"))()

console.log ("step2");
(async () => await get_page("http://localhost/page2"))()
