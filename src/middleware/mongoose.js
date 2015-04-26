module.exports = function(app, options) {
  var mongoose = require('mongoose');
  var uri = options.urls[app.env];

  if(process.env.MONGO_URI) {
    uri = process.env.MONGO_URI.replace(/"/g,'');
    console.info("Using ENV for MongoDB: " + uri)
  }

  mongoose.connect(uri);

  return {
    mongoose: mongoose,
    middleware: function*(next) {
      this.mongoose = mongoose;
      this.models = mongoose.models;
      yield* next;
    }
  };
}
