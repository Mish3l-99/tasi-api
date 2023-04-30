const express = require("express");

// console.log(express.application.listen);

const multer = require("multer");
const path = require("path");

// storage engine
const storage = multer.diskStorage({
  destination: "./images/blogPosts",

  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${path.extname(file.originalname)}`);
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

const Post = require("../models/post");
const User = require("../models/user");

const limitPerPage = 12;

// post a new blogPost
router.post("/add", upload.single("img"), async (req, res) => {
  let img;
  if (req.file) {
    img = `post/${req.file.filename}`;
  }
  const title = req.body.title;
  const des = req.body.des;
  const body = req.body.body;

  const createdAt = Date.now();

  const newPost = new Post({
    title,
    des,
    img,
    body,
    createdAt,
  });

  try {
    const savedPost = await newPost.save();
    return res.status(200).json({ success: true, data: savedPost });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

//get one post
router.get("/one/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const tryFind = await Post.findById(id);
    res.json({ success: true, data: tryFind });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//get all posts in bunches
router.get("/all/:page", async (req, res) => {
  const page = req.params.page - 1;

  try {
    const tryFind = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(page * limitPerPage)
      .limit(limitPerPage);
    res.json({ success: true, data: tryFind });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//get three posts for short
router.get("/short", async (req, res) => {
  try {
    const tryFind = await Post.find({}).sort({ createdAt: -1 }).limit(3);
    res.json({ success: true, data: tryFind });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// delete a blogPost
router.delete("/remove/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const tryRemove = await Post.findById(id).deleteOne();
    res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// update a post
router.patch("/update/:id", getPost, upload.single("img"), async (req, res) => {
  if (req.file) {
    res.post.img = `post/${req.file.filename}`;
  }

  res.post.title = req.body.title;
  res.post.des = req.body.des;
  res.post.body = req.body.body;

  try {
    const updatedPost = await res.post.save();
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// middleware
async function getPost(req, res, next) {
  const id = req.params.id;
  let post;
  try {
    post = await Post.findById(id);
    if (post == null) {
      return res.status(404).json({ message: "post not found!" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.post = post;
  next();
}

module.exports = router;
