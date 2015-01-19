var exports = module.exports = {};

var handlebars = require('handlebars');
var fs = require('fs');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
// TODO: read views directory from settings.
// TODO: `from` settings
// TODO: transporter settings
// TODO: make URL from app.url(...)

exports.creationEmail = function(newEmail, creator, password, settingsUrl) {
  fs.readFile(__dirname + '/../views/mail/accounts/create.hbs', function(err, source) {
    if(err) {
      console.log(err);
      return;
    }
    var data   = {new_user: newEmail, creator: creator, password: password, settings_url: settingsUrl};
    var temp   = handlebars.compile(source.toString());
    var result = temp(data);

    transporter.sendMail({
      from: 'noreply@nowall.el-abid.com',
      to: newEmail,
      subject: 'Your Nowall Account',
      html: result,
      generateTextFromHTML: true
    }, function(error, info) {
      if(error) console.log(error);
    })
  });
}
