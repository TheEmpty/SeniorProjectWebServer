var auth     = require('./../middleware/authentication.js');
var readBody = require('./../middleware/readBody.js');
var crypto   = require('crypto');

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
      var genPass = crypto.randomBytes(12).toString('base64').replace(/\//g,'_');

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
    var user = yield this.models.User.findByEmail(this.form.email);
    yield* next; // temp
    // send an email and set resetCode
    // generate random resetCode
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
