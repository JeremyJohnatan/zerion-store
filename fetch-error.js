const http = require('http');
http.get('http://localhost:3000/checkout/success/cmqq29xyx00000ctychbwwhvx', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('error.html', data);
    console.log("Saved error.html");
  });
});
