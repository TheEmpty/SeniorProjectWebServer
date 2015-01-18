var auth     = require('./../middleware/authentication.js');
var readBody = require('./../middleware/readBody.js');

module.exports = function(app) {
  app.get('dashboard', '/dashboard', auth, function*(next) {
    yield this.render('accounts/dashboard', {
      title: "Dashboard",
      user: yield this.getUser()
    });
  });

  app.get('settings', '/accounts/settings', auth, function*(next) {
    yield this.render('accounts/settings', {
      title: "Settings",
      user: yield this.getUser()
    });
  });

  app.post('/accounts/settings', auth, readBody, function*(next) {
    var user = yield this.getUser();
    console.log(user);

    if(user.checkPassword(this.form.password) == false) {
      this.session.flash.danger = "Wrong password";
      this.response.redirect(app.url('settings'));
    } else if(this.form.new_password !== this.form.new_password_confirmation) {
      this.session.flash.danger = "New password and confirmation do not match.";
      this.response.redirect(app.url('settings'));
    } else {
      user.email = this.form.email;
      if(this.form.new_password.length != 0) {
        user.password = this.form.new_password;
      }
      var _this = this;
      var prom = new Promise(function(resolve, reject) {
        user.save(function(err) {
          if(err == null) {
            _this.session.flash.success = "Account updated";
          } else {
            console.err(err);
            _this.session.flash.danger = "Validation Failed";
          }
          _this.response.redirect(app.url('settings'));
          resolve();
        })
      });
      yield prom;
    }
  });

  app.get('login', '/accounts/login', function*(next) {
    yield this.render('accounts/login', {
      title: "Login"
    });
  });

  app.get('forgotPassword', '/accounts/forgot', function*(next) {
    yield this.render('accounts/forgot', {
      title: "Reset password"
    });
  });

  app.post('/accounts/forgot', readBody, function*(next) {
    var user = yield this.models.User.findByEmail(this.form.email);
    // send an email and set resetCode
    // generate random resetCode
  });

  app.get('logout', '/accounts/logout', function*(next) {
    delete this.session.user_id;
    this.session.flash.info = "You have been logged out."
    this.response.redirect(app.url('login'));
  });

  app.post('/accounts/login', readBody, function*(next) {
    var user = yield this.models.User.findByEmail(this.form.email);

    if(user != null && user.checkPassword(this.form.password)) {
      this.session.flash.success = "Welcome back, " + user.email;
      this.session.user_id = user._id;
      if((this.session.loginFrom || null) != null) {
        var url = this.session.loginFrom;
        this.session.loginFrom = null;
        this.response.redirect(url);
      } else {
        this.response.redirect(app.url('dashboard'));
      }
    } else {
      this.response.type = 'text/html';
      this.session.flash.info = "Invalid username/password.";
      yield this.render('accounts/login', {
        title: "Login",
        email: this.form.email
      });
    }
  })
};
