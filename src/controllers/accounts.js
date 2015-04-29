var auth      = require('../middleware/authentication.js');
var readBody  = require('../middleware/readBody.js');
var readParam = require('../middleware/readParams.js');
var randStr   = require('../helpers/randString.js');

module.exports = function(app) {
  app.get('dashboard', '/dashboard', auth, function*(next) {
    yield this.render('accounts/dashboard', {
      title: "Dashboard",
      user: yield this.getUser()
    });
  });

  // Admin creation
  app.get('new_account', '/accounts/create', auth, function*(next) {
    var user = yield this.getUser();
    if(!user.admin) yield* next;
    else {
      yield this.render('accounts/create', {
        title: "Create User"
      })
    }
  });

  app.post('/accounts/create', auth, readBody, function*(next) {
    var user = yield this.getUser();
    if(!user.admin) yield* next;
    else {
      var genPass = randStr(12);

      var newUser = new this.models.User({
        email: this.form.email,
        admin: this.form.admin == '1',
        creator: user.email,
        password: genPass
      });

      var _this = this;
      var p = new Promise(function(resolve, reject) {
        newUser.save(function(err) {
          if(err) {
            console.log(err);
            _this.session.flash.danger = "Failed to save! " + err;
            resolve(false);
          } else {
            var settingsUrl = _this.request.header.host + app.url('settings');
            _this.mailer.creationEmail(newUser, user, genPass);
            _this.session.flash.info = "Success! They should be getting an email soon.";
            resolve(true);
          }
        })
      });
      var success = yield p;

      yield this.render('accounts/create', {
        title: "Create User"
      })
    }
  });

// Settings
  app.get('settings', '/accounts/settings', auth, function*(next) {
    yield this.render('accounts/settings', {
      title: "Settings",
      user: yield this.getUser()
    });
  });

  app.post('/accounts/settings', auth, readBody, function*(next) {
    if(this.csrfCheck == false) {
      this.session.flash.danger = "Security token (CSRF) invalid."
      this.response.redirect('settings');
      return;
    }

    var user = yield this.getUser();

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

  app.get('forgotPassword', '/accounts/forgot', function*(next) {
    yield this.render('accounts/forgot', {
      title: "Reset password"
    });
  });

  app.post('/accounts/forgot', readBody, function*(next) {
    var _this = this;

    if(typeof this.form.email === "undefined") {
      this.session.flash.warning = "Please provide an email address.";
      this.response.redirect(app.url('forgotPassword'));
      return;
    }

    var user  = yield this.models.User.findByEmail(this.form.email);

    if(user && user.generateReset()) {
      var prom = new Promise(function(resolve, reject) {
        user.save(function(err) {
          if(err) {
            console.log(err);
            _this.session.flash.danger = "Database error";
          } else {
            _this.mailer.recoverEmail(user, _this.models.User.hoursForReset);
            _this.session.flash.info = "Email being sent!";
          }
          resolve();
        });
      });
      yield prom;

    } else {
      this.session.flash.info = "Couldn't find account, or you've requested a reset in the past " + this.models.User.hoursForReset + " hours.";
    }

    yield this.render('accounts/forgot', {
      title: "Reset Password"
    });
  });

  var getResetUser = function*(next) {
    var user;

    if(this.params.email && this.params.code) {
      var _this = this;
      user = yield (new Promise(function(resolve, reject) {
        _this.models.User.findOne({
          email: _this.params.email.toLowerCase(),
          resetCode: _this.params.code
        }, function(err, result) {
          resolve(result);
        });
      }));
    };

    this.user = user;
  }

  app.get('resetPassword', '/accounts/reset', readParam, function*(next) {
    yield getResetUser;

    if(this.user == null) {
      this.session.flash.danger = "Unable to find matching account, your token has probably expired."
      this.response.redirect(app.url('forgotPassword'));
      return;
    }

    yield this.render('accounts/reset', {
      title: "Reset Password",
      code: this.params.code,
      email: this.params.email
    });
  });

  app.post('/accounts/reset', readBody, function*(next) {
    this.params = this.form;
    yield getResetUser;

    if(this.user == null) {
      this.session.flash.danger = "Unable to find matching account, your token has probably expired."
      this.response.redirect(app.url('forgotPassword'));
      return;
    }

    if(this.form.password != this.form.password_confirmation) {
      this.session.flash.warning = "Passwords did not match.";
    } else {
      this.user.password = this.form.password
      this.user.resetCode = null;
      var _this = this;
      var prom = new Promise(function(resolve, reject) {
        _this.user.save(function(err) {
          if(err) {
            _this.session.flash.danger = "There was an issue updating your account."
            resolve(false)
          } else {
            _this.session.flash.info = "Password reset!";
            _this.response.redirect(app.url('login'));
            resolve(true)
          }
        })
      });
      if(yield prom) return;
    }

    yield this.render('accounts/reset', {
      title: "Reset Password",
      code: this.params.code,
      email: this.params.email
    });
  });

  app.get('logout', '/accounts/logout', function*(next) {
    delete this.session.user_id;
    this.session.flash.info = "You have been logged out."
    this.response.redirect(app.url('login'));
  });

// Login
  app.get('login', '/accounts/login', function*(next) {
    yield this.render('accounts/login', {
      title: "Login"
    });
  });

  app.post('/accounts/login', readBody, function*(next) {
    if(this.csrfCheck == false) {
      this.session.flash.danger = "Whoa, the security token was incorrect. Try that again?";
      var user = null;
    } else {
      var user = yield this.models.User.findByEmail(this.form.email);
    }

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
      this.session.flash.info = "Invalid username/password.";
      yield this.render('accounts/login', {
        title: "Login",
        email: this.form ? this.form.email : ''
      });
    }
  })
};
