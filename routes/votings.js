const express = require("express");

const router = express.Router();

const validDayTime = () => {
  const newDate = new Date();
  const dayName = newDate.toLocaleString("en-us", {
    weekday: "long",
  });
  var hour = newDate.getUTCHours();

  // from 9 to 4, minus 3 cuz hour is in gmt
  // console.log(hour);
  if (
    dayName !== "Friday" &&
    dayName !== "Saturday" &&
    hour >= 6 &&
    hour <= 13
  ) {
    return true;
  } else {
    return false;
  }
};

const Voting = require("../models/voting");

// getting voting or set
router.post("/one", async (req, res) => {
  const which = req.body;
  let votingA;
  try {
    votingA = await Voting.find(which);
    if (votingA.length === 0) {
      try {
        if (validDayTime()) {
          const voting = new Voting(req.body);
          const savedNew = await voting.save();
          res.json({ success: true, status: "set", data: savedNew });
        }
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      res.json({ success: true, status: "found", data: votingA[0] });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update votes
router.post("/update", getVoting, async (req, res) => {
  if (req.body.which === "up") {
    res.voting.voters_up++;
  } else {
    res.voting.voters_down++;
  }

  // console.log(res.voting);

  try {
    const updated = await res.voting.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// middleware
async function getVoting(req, res, next) {
  const which = { day: req.body.day };
  let voting;
  try {
    voting = await Voting.find(which);
    if (voting.length === 0) {
      return res.status(404).json({ message: "voting not found!" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.voting = voting[0];
  next();
}

module.exports = router;
