var randStr = require('../helpers/randString.js');

module.exports = function*(next) {
  this.getCsrf = function() {
    if(typeof(this.session.csrf) === "undefined") {
      this.session.csrf = randStr(32);
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
