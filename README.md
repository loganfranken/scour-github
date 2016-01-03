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
* Ignore empty repositories

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

## Options

### HTML Output

```
--html
```

Outputs the results as HTML with links that you can click to open each
repository/organization in a separate browser tab.

```
node scour-github.js {searchTerm} --html > results.html
```

### Minimum Repository Size

```
--min-size={size}
```

Minimum repository "size" (value from the GitHub API). This value can be used
to avoid pulling back empty or very small repositories.

```
node scour-github.js {searchTerm} --min-size=150
```

### Ignore Small Repositories

```
--ignore-small
```

Ignores "small" repositories. This is equivalent to setting the minimum
repository size flag to **200** (`--min-size=200`).

```
node scour-github.js {searchTerm} --ignore-small
```

If this flag is used with the minimum size flag (which is not recommended),
then the greater of the two specified minimum sizes will take precedence.
In other words, if `--min-size=300` and `--ignore-small` are used, 300 will be
used as the minimum size.

## License

[ISC](https://opensource.org/licenses/ISC)
