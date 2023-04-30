const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  img: String,
  des: String,
  body: String,
  createdAt: Number,
  rating: {
    avg: { type: Number, float: true, default: 4.2 },
    count: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("post", postSchema);
