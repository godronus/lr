const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const carSchema = new Schema({
  identifier: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  heading: { type: String, required: true },
  model: { type: String, required: true },
  make: { type: String, required: true },
  year: { type: Number, required: true },
  seller: { type: String },
  location: { type: String, required: true },
  price: { type: Number },
});

module.exports = mongoose.model('Car', carSchema);