var qs = require('querystring');
require('colors');

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
        form = qs.parse(body);
        if(_this.verifyCsrf(form.csrf)) {
          _this.form = form;
          resolve(true);
        } else {
          console.warn("Failed CSRF tag".yellow)
          _this.form = {};
          resolve(false);
        }
      });
    }
  );

  this.csrfCheck = yield p1;
  yield* next;
}
