var fs = require('fs');
var request = require('request');

var options = {
  url: 'https://api.github.com/search/repositories?q=ucsb',
  headers: {
    'User-Agent': 'github-search'
  }
};

// Search Repositories
var repos = [];
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

    results.items.forEach(function(result) {
      repos.push(result);
    });

    pageCount++;
    searchRepositories();

  });
}

function outputResults()
{
  var orgs = {};
  var projects = [];

  repos.forEach(function(repo) {

    // Store Organizations
    if(repo.owner.type === 'Organization')
    {
      orgs[repo.owner.login] = { url: repo.owner.html_url };
    }

    // Store Projects
    else
    {
      projects.push({ url: repo.html_url });
    }

  });

  var content = '<!DOCTYPE html>'
                + '<html>'
                + '<head>'
                + '<meta charset="utf-8">'
                + '<title>GitHub Search Results</title>'
                + '</head>'
                + '<body>';
                + '<h1>GitHub Search Results</h1>';

  // Display Organizations
  var orgCount = 0;
  var orgNames = [];

  for(var org in orgs)
  {
    orgCount++;
    orgNames.push(org);
  }

  content += '<h2>Total Organizations: ' + orgNames.length + '</h2>';

  content += '<ul>';
  for(var index in orgNames)
  {
    var orgName = orgNames[index];
    content += '<li><a href="' + orgs[orgName].url + '" target="_blank">' + orgName + '</a></li>';
  }
  content += '</ul>';

  // Display Projects'
  content += '<h2>Total Projects: ' + projects.length + '</h2>';

  projects.sort(function(p1, p2) {
    return  (p1.url > p2.url) ? 1
            : (p1.url < p2.url) ? -1
            : 0;
  });

  content += '<ul>';
  projects.forEach(function(project) {
    content += '<li><a href="' + project.url + '">' + project.url + '</a></li>';
  });
  content += '</ul>';

  content += '</body></html>';
  fs.writeFile('results.html', content);
}

searchRepositories();
