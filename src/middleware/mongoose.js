require('colors');

module.exports = function(app, options) {
  var mongoose = require('mongoose');
  var uri;

  if(process.env.MONGO_URI) {
    uri = process.env.MONGO_URI.replace(/"/g,'');
    console.info("Overriding Mongo URI in favor of MONGO_URI".red.bold)
  } else {
    // So they don't need to have an entry for env, if using env vars
    uri = options.urls[app.env];
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
