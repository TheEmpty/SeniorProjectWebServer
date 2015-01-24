#Nowall Web Service

## Install

### Docker Install
* Install [Docker](http://docker.com)
* Pull down mongodb, `docker pull dockerfile/mongodb`
* Build the project's docker file, `docker build -t nowall .
* Confirm that mongodb works for you and reserve it's name, run
`sudo docker run --name="mongodb" -p 27017:27017 dockerfile/mongodb mongod --smallfiles`
and press control+c after seeing, "waiting for connections".

### Docker Run
* Start the database, `docker start mongodb`
* Start the project, note, for development you may wish to use `-e "NODE_ENV=development"`
and use a software to rebuild and restart the container on file system changes.

```bash
docker run -it --rm \
  -p 3000:3000 \
  --link mongodb:mongodb \
  nowall
```
