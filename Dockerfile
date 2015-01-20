# FROM dockerfile/ubuntu
FROM debian:jessie
MAINTAINER Mohammad El-Abid <mohammad@el-abid.com>

# Install wget for fetching Node
RUN \
  apt-get update && \
  apt-get install -y wget

# Install Node 0.11.14, has support for ES6
RUN  \
  cd /opt && \
  wget http://nodejs.org/dist/v0.11.14/node-v0.11.14-linux-x64.tar.gz && \
  tar -xzf node-v0.11.14-linux-x64.tar.gz && \
  mv node-v0.11.14-linux-x64 node && \
  cd /usr/local/bin && \
  ln -s /opt/node/bin/* . && \
  rm -f /opt/node-v0.11.14-linux-x64.tar.gz

# Install deps. for compiling native modules in npm
RUN \
  apt-get update && \
  apt-get -y install python make g++ && \
  rm -rf /var/lib/apt/lists/*

# Add the package.json, separate from workdir so we don't have to reinstall everytime
ADD package.json src/package.json
RUN \
  cd /src && \
  npm install --production

# Attach the working directory to /src on host
WORKDIR /src

# eg, export NODE_ENV=production
ENV NODE_ENV production

# FUTURE: USER, don't run as root

# CMD ["/bin/bash"]
CMD ["/src/run.sh"]
