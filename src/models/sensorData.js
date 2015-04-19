module.exports = function(mongoose) {
  var schema = new mongoose.Schema({
    version: { type: Number, required: true, default: 1 },
    userId:  { type: String, required: true },
    value:   { type: Number, required: true },
    sensor:  { type: String, required: true },
    time:    { type: Date,   required: true, default:  Date.now}
  })

  mongoose.model('SensorData', schema);
}
