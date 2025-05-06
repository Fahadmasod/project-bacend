const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: String,
  people: Number,
  isChecked: { type: Boolean, default: false }
});

const groupSchema = new mongoose.Schema({
  index: String,
  sum: Number,
  members: [memberSchema]
}, { _id: true });

const savedDataSchema = new mongoose.Schema({
  groups: [groupSchema],
  total_sum: Number
});

const SavedData = mongoose.model('SavedData', savedDataSchema);

module.exports = SavedData;
