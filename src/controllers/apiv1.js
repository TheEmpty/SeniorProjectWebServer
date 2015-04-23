var readParam = require('../middleware/readParams.js');
var auth      = require('../middleware/authentication.js');

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

  app.get('api_v1_get_sensor', '/api/v1/sensors/get', readParam, auth, function*(next) {
    var sensor = this.params.sensor;

    var start = new Date(0);
    start.setUTCSeconds(this.params.start);

    var end = new Date(0);
    end.setUTCSeconds(this.params.end);

    // get data
    var _this = this;
    var prom = new Promise(function(resolve, reject) {
      _this.models.SensorData.
      where('sensor').equals(sensor).
      where('userId').equals(_this.session.user_id).
      where('time').gte(start).lte(end).
      exec(function(err, results) {
        resolve(results);
      });
    });

    var data = yield prom;
    this.body = data
    this.type = "application/json"
  })

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
