module.exports = function(app, options) {
  var mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URL || options.urls[app.env]);

  return {
    mongoose: mongoose,
    middleware: function*(next) {
      this.mongoose = mongoose;
      this.models = mongoose.models;
      yield* next;
    }
  };
}
