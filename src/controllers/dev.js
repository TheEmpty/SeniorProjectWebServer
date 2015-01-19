module.exports = function(app) {
  app.get('/dev/csrf', function*(next) {
    this.body = {
      csrf: this.getCsrf()
    }
  });
}
