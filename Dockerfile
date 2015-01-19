# FROM dockerfile/ubuntu
FROM debian:jessie

RUN \
  apt-get update && \
  apt-get -y install python python-dev python-pip python-virtualenv && \
  rm -rf /var/lib/apt/lists/*

RUN  \
  cd /opt && \
  wget http://nodejs.org/dist/v0.11.14/node-v0.11.14-linux-x64.tar.gz && \
  tar -xzf node-v0.11.14-linux-x64.tar.gz && \
  mv node-v0.11.14-linux-x64 node && \
  cd /usr/local/bin && \
  ln -s /opt/node/bin/* . && \
  rm -f /opt/node-v0.11.14-linux-x64.tar.gz

WORKDIR /src
ENV NODE_ENV production 

# RUN \
#  cd /src && \
#  npm install --production

# USER

CMD ["/bin/bash"]
