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
      onSearchComplete();
      return;
    }

    results.items.forEach(function(result) {
      repos.push(result);
    });

    pageCount++;
    searchRepositories(term);

  });
}

function onSearchComplete(output)
{
  var orgs = {};
  var projects = [];

  // Split organizations/projects
  repos.forEach(function(repo) {

    // Organizations
    if(repo.owner.type === 'Organization')
    {
			// We use an object (rather than array) to store the organizations
			// since we want a *distinct* list (no duplicates)
			orgs[repo.owner.login] = {
        name: repo.owner.login, url:
        repo.owner.html_url
      };
    }

    // Projects
    else
    {
      projects.push({ url: repo.html_url });
    }

  });

	// Copy our key-value object into an array
	var orgsList = [];
	for(var org in orgs) {
		orgsList.push(orgs[org]);
	}

  // Sort
  orgsList.sort(function(o1, o2) {
    return o1.name.toLowerCase().localeCompare(o2.name.toLowerCase());
  });

  projects.sort(function(p1, p2) {
    return p1.url.toLowerCase().localeCompare(p2.url.toLowerCase());
  });

  // Output
  if(cli.flags.html)
  {
    outputHtml(orgsList, projects);
  }
  else
  {
    outputConsole(orgsList, projects);
  }
}

function outputHtml(orgs, projects)
{
    // Header
    console.log('<!DOCTYPE html>'
                + '<html>'
                + '<head>'
                + '<meta charset="utf-8">'
                + '<title>GitHub Search Results</title>'
                + '</head>'
                + '<body>'
                + '<h1>GitHub Search Results</h1>');

    // Organizations
    console.log('<h2>Total Organizations: ' + orgs.length + '</h2>');

    console.log('<ul>');
    orgs.forEach(function(org) {
      console.log('<li><a href="' + org.url + '" target="_blank">' + org.name + '</a></li>');
    });
    console.log('</ul>');

    // Projects
    console.log('<h2>Total Projects: ' + projects.length + '</h2>');

    console.log('<ul>');
    projects.forEach(function(project) {
      console.log('<li><a href="' + project.url + '" target="_blank">' + project.url + '</a></li>');
    });
    console.log('</ul>');

    // Footer
    console.log('</body></html>');
};

function outputConsole(orgs, projects) {

  // Header
  console.log('GitHub Search Results');
  console.log('\n')

  // Organizations
  console.log('Total Organizations: ' + orgs.length);

  orgs.forEach(function(org) {
    console.log(org.url);
  });

  console.log('\n');

  // Projects
  console.log('Total Projects: ' + projects.length);

  projects.forEach(function(project) {
    console.log(project.url);
  });

};
