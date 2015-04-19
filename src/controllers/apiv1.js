var readParam = require('../middleware/readParams.js');

module.exports = function(app) {
  var modelFromId = function(model, id) {
    var _this = this;
    var prom = new Promise(function(resolve, reject) {
      model.findOne({_id: id}, function(err, record) {
        resolve(record)
      });
    });

    return prom;
  }

  app.put('api_v1_sensor', '/api/v1/sensor', readParam, function*(next) {
    var user = yield modelFromId(this.models.User, this.params.account)

    if(typeof(user) == "null") {
      this.body = {error: true};
      return;
    }

    // Add sensor data
    var newData = this.models.SensorData({
      userId: user._id,
      value:  this.params.value,
      sensor: this.params.sensor
    })

    var prom = new Promise(function(resolve, reject) {
      newData.save(function(err) {
        resolve(err)
      })
    });
    var error = yield prom;

    this.body = {error: typeof(error) == "null"};
  })
}
