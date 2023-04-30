const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  company_name: String,
  stocks: Number,
  stock_price: Number,
  createdAt: Number,
  validUpto: Number,
  user_id: String,
  user_name: String,
});

module.exports = mongoose.model("ad", adSchema);
