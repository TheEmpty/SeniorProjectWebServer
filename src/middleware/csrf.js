var crypto = require('crypto');


module.exports = function*(next) {
  this.getCsrf = function() {
    if(typeof(this.session.csrf) === "undefined") {
      this.session.csrf = crypto.randomBytes(32).toString('base64').replace(/\//g,'_');
    }

    return this.session.csrf;
  }

  this.verifyCsrf = function(check) {
    if(typeof(this.session.csrf) !== "undefined") {
      var real = this.session.csrf;
      delete this.session.csrf;
      return real === check;
    }
    return false;
  }

  yield* next;
}
