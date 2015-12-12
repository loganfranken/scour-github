var fs = require('fs');
var meow = require('meow');
var request = require('request');

var cli = meow({
	help: [
		'Usage',
		'  $ scour-github <search-term>',
		'',
		'Options',
		'  --html     Output results in HTML',
	]
});

searchRepositories(cli.input[0]);

// Search Repositories
var repos = [];
var pageCount = 1;

function searchRepositories(term)
{
  var options = {
    url: 'https://api.github.com/search/repositories?q=',
    headers: {
      'User-Agent': 'github-search'
    }
  };

  options.url += (term + '&page=' + pageCount);

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
    searchRepositories(term);

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

  orgNames.sort(function(o1, o2) {
    return o1.toLowerCase().localeCompare(o2.toLowerCase());
  });

  console.log('<h2>Total Organizations: ' + orgNames.length + '</h2>');

  console.log('<ul>');
  orgNames.forEach(function(orgName) {
    console.log('<li><a href="' + orgs[orgName].url + '" target="_blank">' + orgName + '</a></li>');
  });
  console.log('</ul>');

  // Display Projects
  console.log('<h2>Total Projects: ' + projects.length + '</h2>');

  projects.sort(function(p1, p2) {
    return p1.url.toLowerCase().localeCompare(p2.url.toLowerCase());
  });

  console.log('<ul>');
  projects.forEach(function(project) {
    console.log('<li><a href="' + project.url + '" target="_blank">' + project.url + '</a></li>');
  });
  console.log('</ul>');

  console.log('</body></html>');
}
