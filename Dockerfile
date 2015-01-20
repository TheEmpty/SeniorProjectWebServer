# FROM dockerfile/ubuntu
FROM debian:jessie
MAINTAINER Mohammad El-Abid <mohammad@el-abid.com>

# Install deps. for compiling native modules in npm
RUN \
  apt-get update && \
  apt-get -y install wget python make g++ && \
  rm -rf /var/lib/apt/lists/*

# Install Node 0.11.14, has support for ES6
RUN  \
  cd /opt && \
  wget http://nodejs.org/dist/v0.11.14/node-v0.11.14-linux-x64.tar.gz && \
  tar -xzf node-v0.11.14-linux-x64.tar.gz && \
  mv node-v0.11.14-linux-x64 node && \
  cd /usr/local/bin && \
  ln -s /opt/node/bin/* .

# eg, export NODE_ENV=production
ENV NODE_ENV production

# Add the package.json, separate from workdir so we don't have to reinstall everytime
ADD package.json src/package.json
RUN \
  cd /src && \
  npm install --production

# Add source 
ADD . /src

# Our startup script
CMD ["/src/run.sh"]
