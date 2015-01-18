var qs = require('querystring');

module.exports = function*(next) {
  var _this = this;
  var p1 = new Promise(
    function(resolve, reject) {
      body = '';

      _this.req.on('data', function(data) {
        body += data;
        if (body.length > 1e6) {
          _this.req.connection.destroy();
        }
      });

      _this.req.on('end', function() {
        _this.form = qs.parse(body);
        resolve(_this.form);
      });
    }
  );

  yield p1;
  yield* next;
}
