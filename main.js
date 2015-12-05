var request = require('request');

var options = {
  url: 'https://api.github.com/search/repositories?q=ucsb',
  headers: {
    'User-Agent': 'github-search'
  }
};

// Search Repositories
var urls = [];
var pageCount = 1;

function searchRepositories()
{
  options.url += ('&page=' + pageCount);

  request(options, function (error, response, body) {

    var results = JSON.parse(body);

    if(!results.items || results.items.length === 0) {
      outputResults();
      return;
    }

    results.items.forEach(function(result, i) {
      urls.push(result.html_url);
    });

    pageCount++;
    searchRepositories();

  });
}

function outputResults()
{
  // Display Results
  console.log('Total Results: ' + urls.length);

  urls.forEach(function(url, i) {
    console.log(url);
  });
}

searchRepositories();
