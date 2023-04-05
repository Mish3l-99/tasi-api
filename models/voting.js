const mongoose = require("mongoose");

const votingSchema = new mongoose.Schema({
  stock: String,
  day: String,
  voters_up: { type: Number, required: true, default: 0 },
  voters_down: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("voting", votingSchema);
