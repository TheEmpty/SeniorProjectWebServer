module.exports = function(mongoose) {
  var schema = new mongoose.Schema({
    version: { type: Number, required: true, default: 1 },
    userId:  { type: String, required: true, index: true },
    value:   { type: Number, required: true },
    sensor:  { type: String, required: true, index: true },
    time:    { type: Date,   required: true, default: Date.now, index: true}
  })

  mongoose.model('SensorData', schema);
}
