module.exports = function(app) {
  app.get('home', '/', function*() {
    yield this.render('root-pages/cover', {
      title: 'Nowall'
    })
  });

  app.get('features', '/features', function*() {
    yield this.render('root-pages/features', {
      title: 'Nowall Features'
    });
  });

  app.get('contact', '/contact', function*() {
    yield this.render('root-pages/contact', {
      title: 'Nowall Contact'
    });
  });
};
