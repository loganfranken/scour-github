# Scour GitHub

A command line utility for efficiently searching GitHub.

## Background

I'm researching how various higher education institutions make use of
open-source and wanted a utility to make searching through GitHub for
organizations and projects easier.

Features include:

* Output results as a list of links
* Separate organizations from projects
* Alphabetized results

## Usage

Simply enter your search term on the command line to print the results to
the console:

```
node scour-github.js ucsb
```

You can, of course, output the results to a file instead:

```
node scour-github.js ucsb > results.txt
```

Or, if you would prefer HTML output with links that you can click:

```
node scour-github.js ucsb --html > results.html
```

## License

[ISC](https://opensource.org/licenses/ISC)
