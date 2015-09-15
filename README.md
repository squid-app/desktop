# Squid for Mac

Squid is a small cool tool that give you a quick access to all your Github repositories/issues, straight from from your Mac OS X menu bar.


#### Dependencies

* [Squid Core](https://github.com/squid-app/core) and his dependencies.
* [nw.js](http://nwjs.io/)

All data are served by the [Github API](https://developer.github.com/v3/).


<hr>

#### Table of Content

* [Installation](#installation)
* [Build app](#build-app)
* [Github API Authorization](github-api-authorization)
* [Troubleshoots](#troubleshoots)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [Release History](CHANGELOG.md)


## Installation

First install required packages:

	$ npm install
	
Than run Gulp command to build source and start `watch` task:

	$ gulp init
	
`watch` task will automaticly update application's build when you change one of the following files:

* `src/html/*`
* `src/img/*`
* `config/*`
* `scripts/updater.js`
	
Now you are ready to launch Squid. Go ahead and run into a new terminal window:

	$ npm start
		
	
## Build app

To build a standalone app and his installer run these command:

	$ gulp build
	
The freshly builded app will be available into the `release` folder.


## Github API Authorization

As [recommended by Github](https://developer.github.com/v3/oauth/#non-web-application-flow) we use the Basic Authentication to create an OAuth2 token: 

> With this technique, a username and password need not be stored permanently, and the user can revoke access at any time

## Troubleshoots

if gulp throw a `'Error: EMFILE, open '/path/to/package.json' error`, run the following command: 

	ulimit -S -n 2048 
	
## Roadmap

See the [roadmap](https://github.com/squid-app/desktop/milestones) future developments.


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.
