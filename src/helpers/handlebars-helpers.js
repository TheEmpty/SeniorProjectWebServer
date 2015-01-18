module.exports = function(app, hbs) {
  hbs.registerHelper('navbarLink', function(text, url) {
    var path = hbs.templateOptions.data.koa.koa.url(url);
    var text = hbs.Utils.escapeExpression(text);
    var url  = hbs.Utils.escapeExpression(path);

    var str = '<li><a href="' + url + '"';
    if(hbs.templateOptions.data.koa.request.path === url) {
      str += ' class="active"';
    }
    str += '>' + text + '</a></li>';

    return new hbs.SafeString(str)
  });

  hbs.registerHelper('urlFor', function(name) {
    var url = hbs.templateOptions.data.koa.koa.url(name);
    return new hbs.SafeString(url);
  })

  hbs.registerHelper('linkTo', function(str, name) {
    var url = hbs.templateOptions.data.koa.koa.url(str);
    var link = "<a href='" + url + "'>" + name + "</a>";
    return new hbs.SafeString(link);
  });

  hbs.registerHelper('ifLoggedIn', function(options) {
    var context = hbs.templateOptions.data.koa;
    if(context.session.user_id) {
      return new hbs.SafeString(options.fn(this));
    }
    return '';
  })

  hbs.registerHelper('ifAdmin', function(user, options) {
    var context = hbs.templateOptions.data.koa;
    if(context.session.user_id) {
      if(user.admin) {
        return new hbs.SafeString(options.fn(this));
      }
    }
    return '';
  })

  hbs.registerHelper('flash', function() {
    var koa = hbs.templateOptions.data.koa;
    var keys = Object.keys(koa.session.flash);
    var out = '';

    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var msg = hbs.Utils.escapeExpression(koa.session.flash[key]);
      out += "<div role='alert' class='alert alert-" + key + "'>" + msg + "</div>";
      delete koa.session.flash[key];
    }

    return new hbs.SafeString(out);
  });
};
