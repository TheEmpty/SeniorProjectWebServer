var crypto = require('crypto');

module.exports = function(size) {
  return crypto.randomBytes(size).toString('base64').replace(/\//g,'_');
}
