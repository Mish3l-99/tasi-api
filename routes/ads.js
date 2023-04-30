const express = require("express");

const router = express.Router();

// console.log(express.application.listen);

const limitPerPage = 12;

const Ad = require("../models/ad");
const User = require("../models/user");

// post a new ad
router.post("/add", async (req, res) => {
  const body = req.body;

  const createdAt = Date.now();

  const validity = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const validUpto = createdAt + validity;

  const newAd = new Ad({
    ...body,
    createdAt,
    validUpto,
  });

  try {
    const savedAd = await newAd.save();
    return res.status(200).json({ success: true, data: savedAd });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

//get all ads
router.get("/all/:page", async (req, res) => {
  const page = req.params.page - 1;

  const now = new Date().getTime();

  // delete old ads
  // await Ad.deleteMany({
  //   validUpto: { $lte: now },
  // });

  try {
    const tryFind = await Ad.find({
      validUpto: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .skip(page * limitPerPage)
      .limit(limitPerPage);
    res.json({ success: true, data: tryFind });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//get user ads
router.get("/list/:id", async (req, res) => {
  const id = req.params.id;

  const now = new Date().getTime();

  try {
    const tryFind = await Ad.find({
      user_id: id,
      validUpto: { $gt: now },
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: tryFind });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// delete an ad
router.delete("/remove/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const tryRemove = await Ad.findById(id).deleteOne();
    res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// update an ad
router.patch("/update", async (req, res) => {
  const { id, stock_price, stocks, company_name } = req.body;

  try {
    const ourAd = await Ad.findById(id);
    ourAd.stock_price = stock_price;
    ourAd.stocks = stocks;
    ourAd.company_name = company_name;

    const tryUpdate = await ourAd.save();

    res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
