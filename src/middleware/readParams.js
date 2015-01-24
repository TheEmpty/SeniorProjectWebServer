var qs = require('querystring');

module.exports = function*(next) {
  this.params = qs.parse(this.request.querystring);
  yield* next;
}
