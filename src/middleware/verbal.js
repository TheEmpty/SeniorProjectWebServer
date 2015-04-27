require('colors');

var niceStatus = function(response) {
  // NOTE: this is very exclusive, didn't bother with a lot of headers
  status = new String(response.status);

  if(response.status == 200) {
    return status.green.bold + ' ' + response.message.green;
  } else if(response.status == 304 || response.status == 302 || response.status == 301) {
    return status.yellow.bold + ' ' + response.message.yellow;
  } else {
    return status.red.bold + ' ' + response.message.red;
  }
};

module.exports = function*(next) {
  var start = new Date();
  yield next;
  var end = new Date();
  this.response.header['x-response-time'] = end - start;

  console.info(this.req.connection.remoteAddress + ' - ' + this.request.method.bold + ' ' + this.request.url + ' => ' + niceStatus(this.response) + ' in ' + this.response.header['x-response-time'] + 'ms (' + (this.response.header['content-length'] || 0) + ' characters)');
};
