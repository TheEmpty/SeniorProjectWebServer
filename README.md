#Nowall Web Service

## Install (dev)
* Install [node.js](http://nodejs.org)
* Install [mongodb](http://mongodb.org)
* Then `npm install -g nodemon`
* Inside project directory, `npm install`
* In order to run the application, mongodb must be up and running (can be configured in `config.json`).
* `nodemon` to start the server on port 3000 and have it restart on file changes.

## Install (server)
* Install and run mongodb.
* Make sure your config.json has correct mongodb settings for env. (note that you can pass a location for a server specific config.json via ``./src/app.js 3000 myConfig.json`)
* `npm install -g forever`
* `forever -c "node --harmony" src/app.js 3000`

## Issues
* No CSRF tags, allowing for replay attacks

## Next Steps
* Create user (admin)
* Edit users (admin)
* CSRF tags
* Reset password
* Upload data from device
* Show charts / dashboard
