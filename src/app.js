require('colors');

// Configuration
var app    = require('koa')();
var conFile= process.argv[3] || __dirname + "/../config.json";
var config = require(conFile);
var port   = process.argv[2] || config.port;
app.keys   = [config.cookieKey];
console.info("Running in: ".green.bold + app.env.blue.bold)

// Nasty little hack so we use SendGrid in prod
if(process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
  console.info("Overriding config.mailer.transport because of Sendgrid Env vars".red.bold)

  config.mailer.transport = require('nodemailer-sendgrid-transport')({
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENDGRID_PASSWORD
    }
  })
}

// Modules
var fs       = require('fs');
var hbs      = require('koa-hbs');
var router   = require('koa-router');
var koacache = require('koa-static-cache');
var mongo    = require('./middleware/mongoose.js')(app, config.mongoose);
var session  = require('koa-generic-session');
var mCookie  = require('koa-session-mongoose');
var mailer   = require('./helpers/mailer.js')(app, config.mailer);
require('./helpers/handlebars-helpers.js')(app, hbs);

// Middleware
// Note: verbal should always come first.
// Koa Cache should always come second.
// Router should always come last.
app.use(require('./middleware/verbal.js'));
app.use(koacache(config["koa-cache"].cacheSrc, config["koa-cache"].cacheOpt));
app.use(mongo.middleware);
app.use(session({ store: mCookie.create() }));
app.use(function*(next) {
  this.koa = app;
  this.mailer = mailer;
  this.session.flash = this.session.flash || {};
  yield* next;
});
app.use(require('./middleware/csrf.js'));
config.handlebarsConfig['disableCache'] = config.handlebarsConfig['disableCache'] || app.env == "development"
app.use(hbs.middleware(config.handlebarsConfig));
app.use(router(app));

// 404 Page, no other middleware served a page.
app.use(function*(next) {
  this.status = 404;
  yield this.render('errors/404', {
    url: this.request.url
  });
});

// Models
var models = fs.readdirSync(__dirname + '/models');
for(i = 0; i < models.length; i++) {
  console.log(('Loading ' + models[i] + ' model').yellow.bold);
  require('./models/' + models[i])(mongo.mongoose);
}

// Controllers
var controllers = fs.readdirSync(__dirname + '/controllers');
for(i = 0; i < controllers.length; i++) {
  console.log(('Loading ' + controllers[i] + ' controller').yellow.bold);
  require('./controllers/' + controllers[i])(app);
}

// Create default user
mongo.mongoose.models.User.count({}, function(err, count) {
  if(err == null && count == 0) {
    var User = mongo.mongoose.models.User
    var callback = function(err) {
      if(err == null) {
        console.info("Created a default account.".blue.bold)
      }
    }

    new User({
      email: "mohammad.elabid@gmail.com",
      password: "password",
      admin: true
    }).save(callback)

    new User({
      email: "arushiv@my.bridgeport.edu",
      password: "arushi",
      admin: true
    }).save(callback)

    new User({
      email: "lvilaboi@my.bridgeport.edu",
      password: "olive",
      admin: true
    }).save(callback)
  }
});

// Ready
console.info('Listening on port '.green + new String(port).magenta.bold);
app.listen(port);
