const http = require('http');

http.get('http://localhost:3000/checkout/success/cmqq29xyx00000ctychbwwhvx', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log("Response starts with:");
    console.log(data.substring(0, 1000));
  });
});
