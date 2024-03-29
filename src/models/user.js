var bcrypt     = require('bcrypt');
var randStr    = require('../helpers/randString.js');
var saltFactor = 10;

module.exports = function(mongoose) {
  var schema = new mongoose.Schema({
    version:   { type: Number, required:true, default: 1},
    email:     { type: String, required: true, index: { unique: true } },
    creator:   { type: String },
    password:  { type: String, required: true },
    resetCode: { type: String },
    resetTime: { type: Date },
    admin:     { type: Boolean, default: false, required: true }
  });

  schema.pre('save', function(next) {
    this.email = this.email.toLowerCase();
    next();
  });

  // blowfish, save password
  schema.pre('save', function(next) {
    if(this.isModified('password') == false) return next();
    var salt = bcrypt.genSaltSync(saltFactor);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  });

  // blowfish, check password
  schema.methods.checkPassword = function(attempt) {
    return bcrypt.compareSync(attempt, this.password);
  }

  var hoursForReset = schema.statics.hoursForReset = (process.env.NODE_ENV == 'development') ? 0 : 24;

  schema.methods.generateReset = function() {
    if(typeof(this.resetTime) == 'undefined' || new Date() - this.resetTime >= 1000 * 60 * 60 * hoursForReset) {
      this.resetCode = randStr(32);
      this.resetTime = new Date();
      return true;
    }
    return false;
  }

  schema.statics.findByEmail = function(email) {
    return new Promise(function(resolve, reject) {
      mongoose.models.User.findOne({email: email.toLowerCase()}, function(err, user) {
        resolve(user);
      });
    });
  }

  mongoose.model('User', schema);
};
