#Nowall Web Service

## Install

### Docker Install
* Install [Docker](http://docker.com)
* Setup a mongodb image, `docker run -d --name="mongodb" -p 27017:27017 dockerfile/mongodb`
* Inside project folder, build docker image, `docker build -t 'theempty/seniorproject'`

### Docker Run
* Start mongodb, if it's not already running, `docker start mongodb`
* Start the project, for production, remove ``-v `pwd`:/src``

```bash
docker run -it --rm \
-p 3000:3000 \
-v `pwd`:/src \
--link mongodb:mongodb \
theempty/seniorproject
```


## Purposed Device Integration

### Linking a device to an account
* Device has a uniquie device ID, udid.
* We save this udid on our server as valid (prevent knock-offs from making their own udids).
* User goes to Nowall site (or perhaps during device setup) and creates account, putting in the udid.
* Now the device will constantly upload data via rolling CSV storage.

### Device sending requests
* Device prepares data for POST upload.
* Device puts in query URL the time and udid.
* Device signs this (somehow, perhaps signature created by factory during udid), preventing replay attacks and malicious activity.
* Device sends request.
