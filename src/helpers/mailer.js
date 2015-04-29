var handlebars = require('handlebars');
var fs = require('fs');
var nodemailer = require('nodemailer');
var templateCache = {};

// TODO: record of emails (succesfully) sent (for anything that happens to brake)

module.exports = function(app, config) {
  return new Mailer(app, config);
}

function Mailer(app, config) {
  this.app = app;
  this.config = config;
  this.transporter = nodemailer.createTransport(config.transport);
}

Mailer.prototype.getView = function(file, callback) {
  if(templateCache[file]) {
    callback(templateCache[file]);
    return;
  }

  var path = __dirname + '/../../' + this.config.mailViews + '/' + file + '.hbs';
  fs.readFile(path, function(err, stream) {
    if(err) {
      console.log(err);
    } else {
      var compiled = handlebars.compile(stream.toString());
      templateCache[file] = compiled;
      callback(templateCache[file]);
    }
  });
}

Mailer.prototype.url = function(name) {
  return "http://" + this.config.domain + this.app.url(name);
}

Mailer.prototype.completionHandler = function(err, info) {
  if(err)  console.log(err);
  if(info) console.log(info);
}

Mailer.prototype.creationEmail = function(user, creator, password) {
  var _this = this;

  this.getView('accounts/create', function(template) {
    var message = template({
      new_user: user.email,
      creator: creator.email,
      password: password,
      settings_url: _this.url('settings')
    });

    if(_this.app.env == "development") console.log(message);

    _this.transporter.sendMail({
      from: _this.config.from,
      to: user.email,
      subject: 'Your New Nowall Account',
      html: message,
      generateTextFromHTML: true
    }, _this.completionHandler);
  });
};

Mailer.prototype.recoverEmail = function(user, hours) {
  var _this = this;

  this.getView('accounts/recover', function(template) {
    var message = template({
      email: user.email,
      url: _this.url('resetPassword') + '?email=' + encodeURIComponent(user.email) + '&code=' + encodeURIComponent(user.resetCode),
      hours: hours
    });

    if(_this.app.env == "development") console.log(message);

    _this.transporter.sendMail({
      from: _this.config.from,
      to: user.email,
      subject: 'Reset Nowall Password',
      html: message,
      generateTextFromHTML: true
    }, _this.completionHandler)
  })
}
