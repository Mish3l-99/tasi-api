const express = require("express");

const multer = require("multer");
const path = require("path");

var bcrypt = require("bcryptjs");

// storage engine
const storage = multer.diskStorage({
  destination: "./images/profiles",
  filename: (req, file, cb) => {
    return cb(null, `${req.params.id}${path.extname(file.originalname)}`);
    // return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// 10 mb profile pic max
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000,
  },
});

const router = express.Router();

const User = require("../models/user");

// getting one  // get profile
router.get("/one/:id", getUser, (req, res) => {
  res.json({ success: true, data: res.user });
});

// login
router.post("/login", async (req, res) => {
  let form = { email: req.body.email };
  let user;
  try {
    const withEmail = await User.find(form);
    withEmail.map((u) => {
      if (bcrypt.compareSync(req.body.pass, u.password)) {
        user = u;
      }
    });
    if (!user) {
      return res.status(404).json({ message: "wrong data" });
    } else {
      res.json({ success: true, data: user });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// creating one // sign up
router.post("/new", async (req, res) => {
  try {
    let users = await User.find({ email: req.body.email });
    if (users.length === 0) {
      let user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.pass,
      });
      try {
        const savedUser = await user.save();
        res.status(201).json({ success: true, user: savedUser });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    } else {
      return res.status(404).json({ message: "email exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// update user votes
router.post("/vote/:id", getUser, async (req, res) => {
  res.user.lastVoted = req.body.timeNow;

  try {
    const updatedUser = await res.user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// updating one
router.patch("/update/:id", getUser, upload.single("img"), async (req, res) => {
  if (req.file) {
    res.user.image = `profile/${req.file.filename}`;
  }

  const withEmail = User.find({ email: req.body.email });
  if (withEmail.length === 0) {
    res.user.email = req.body.email;
  }

  res.user.password = req.body.password;
  res.user.username = req.body.username;

  try {
    const updatedUser = await res.user.save();
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// middleware
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "user not found!" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.user = user;
  next();
}

module.exports = router;
