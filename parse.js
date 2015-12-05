var fs = require('fs')

fs.readFile('test.txt', 'utf-8', function (err, data) {

  var urls = data.split('\n');
  console.log(urls.length);

});
