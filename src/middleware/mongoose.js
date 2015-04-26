module.exports = function(app, options) {
  var mongoose = require('mongoose');
  var uri = process.env.MONGO_URI || options.urls[app.env];
  mongoose.connect(uri.toString());

  return {
    mongoose: mongoose,
    middleware: function*(next) {
      this.mongoose = mongoose;
      this.models = mongoose.models;
      yield* next;
    }
  };
}
