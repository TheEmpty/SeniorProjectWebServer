#Nowall Web Service

## Install

### Docker Install
* Install [Docker](http://docker.com)
* Setup a mongodb image, `docker run -d --name="mongodb" -p 27017:27017 dockerfile/mongodb`
* Inside project folder, build docker image, `docker build -t 'theempty/seniorproject'`

### Docker Run
* Start mongodb, if it's not already running, `docker start mongodb`
* Start the project,
  ```bash
  docker run -it --rm \
  -p 3000:3000 \
  -v `pwd`:/src \
  --link mongodb:mongodb \
  theempty/seniorproject
  ```
