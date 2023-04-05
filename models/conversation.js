const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  createdAt: Number,
  from: String,
  image: String,
  text: String,
  user: String,
});

const withSchema = new mongoose.Schema(
  {
    user: String,
    image: String,
    username: String,
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema({
  participants: [String],
  withs: [withSchema],
  messages: [messageSchema],
});

module.exports = mongoose.model("conversation", conversationSchema);
