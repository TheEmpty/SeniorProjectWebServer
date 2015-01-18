module.exports = function*(next) {
  if(typeof(this.session.user_id) === "undefined") {
    this.session.loginFrom = this.request.url;
    this.session.flash.info = "Please login first."
    this.response.redirect('/accounts/login');

  } else {

    var user = null;
    this.getUser = function*() {
      if(user == null) {
        var _this = this;
        var prom = new Promise(function(resolve, reject) {
          _this.models.User.findOne({_id: _this.session.user_id}, function(err, user) {
            resolve(user);
          });
        });
        user = yield prom;
      }
      return user;
    }

    yield* next;
  }
};
