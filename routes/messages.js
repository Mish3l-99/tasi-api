const express = require("express");

const router = express.Router();

// console.log(express.application.listen);

const limit = 12;

const Message = require("../models/message");

// get chat
router.get("/all", async (req, res) => {
  const MssgsNum = await Message.find({}).countDocuments();

  //   if (MssgsNum > limit) {
  //   }
  try {
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, MssgsNum, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
    // console.log(error);
  }
});

// send one
router.post("/send", async (req, res) => {
  const messageBody = req.body;
  const message = new Message(messageBody);

  try {
    await message.save();
    res.status(201).json({ succss: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }

  // if(Message.)
});

module.exports = router;
