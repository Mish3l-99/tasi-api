const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  image: String,
  username: String,
  lastVoted: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("user", userSchema);
