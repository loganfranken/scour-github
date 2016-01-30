'use strict';

const fs = require('fs');
const meow = require('meow');
const request = require('request');

const SmallRepoSize = 150;

const cli = meow(`
		Usage
		  $ scour-github <search-term>

		Options
		  --html							Output results in HTML
			--ignore-small			Ignore "small" repositories
			--min-size={value}	Minimum repository size
`);

var searchTerm = cli.input[0];

if(!searchTerm)
{
	console.error("No search term provided");
	return;
}

searchRepositories(searchTerm);

var repos = [];
var pageCount = 1;

function searchRepositories(term)
{
  let options = {
    url: 'https://api.github.com/search/repositories?q=',
    headers: {
      'User-Agent': 'github-search'
    }
  };

  options.url += (term + '&page=' + pageCount);

  request(options, (error, response, body) => {

    let results = JSON.parse(body);

		// If we hit the GitHub rate limit, wait a minute and try again
		if(results.message && results.message.startsWith('API rate limit'))
		{
			setTimeout(() => { searchRepositories(term); }, 60000);
			return;
		}

    if(!results.items || results.items.length === 0) {
      onSearchComplete();
      return;
    }

    results.items.forEach(result => {
      repos.push(result);
    });

    pageCount++;
    searchRepositories(term);

  });
}

function onSearchComplete(output)
{
  let orgs = {};
  let projects = [];

  // Split organizations/projects
  repos.forEach(repo => {

		var minSize = 0;

		if(cli.flags.minSize)
		{
			minSize = cli.flags.minSize;
		}

		if(cli.flags.ignoreSmall && SmallRepoSize > minSize)
		{
			minSize = SmallRepoSize;
		}

		if(minSize && repo.size < minSize)
		{
			return;
		}

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
	let orgsList = [];
	for(let org in orgs) {
		orgsList.push(orgs[org]);
	}

  // Sort
  orgsList.sort((o1, o2) => {
    return o1.name.toLowerCase().localeCompare(o2.name.toLowerCase());
  });

  projects.sort((p1, p2) => {
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
    console.log(`<!DOCTYPE html>
                <html>
                <head>
                <meta charset="utf-8">
                <title>GitHub Search Results</title>
                </head>
                <body>
                <h1>GitHub Search Results</h1>`);

    // Organizations
    console.log(`<h2>Total Organizations: ${orgs.length}</h2>`);

    console.log('<ul>');
    orgs.forEach(org => {
      console.log(`<li><a href="${org.url}" target="_blank">${org.name}</a></li>`);
    });
    console.log('</ul>');

    // Projects
    console.log(`<h2>Total Projects: ${projects.length}</h2>`);

    console.log('<ul>');
    projects.forEach(project => {
      console.log(`<li><a href="${project.url}" target="_blank">${project.url}</a></li>`);
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
  console.log(`Total Organizations: ${orgs.length}`);

  orgs.forEach(org => {
    console.log(org.url);
  });

  console.log('\n');

  // Projects
  console.log(`Total Projects: ${projects.length}`);

  projects.forEach(project => {
    console.log(project.url);
  });

};
