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

const savedDataSchema1 = new mongoose.Schema({
  groups: [groupSchema],
  total_sum: Number
});

// Two different collections
const SavedData = mongoose.model('SavedData', savedDataSchema);   // → Collection: saveddatas
const SavedData1 = mongoose.model('SavedData1', savedDataSchema1); // → Collection: saveddata1

// ✅ Export both
module.exports = {
  SavedData,
  SavedData1
};
