const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const router = express.Router();

// route  ==> POST /api/post
// desc   ==> Create a new post
// access ==> Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      const { name, avatar } = await User.findById(req.user.id);
      const post = new Post({
        text: req.body.text,
        name,
        avatar,
        user: req.user.id
      });

      await post.save();
      res.send(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// route  ==> GET /api/post
// desc   ==> Get all posts
// access ==> Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.send(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// route  ==> GET /api/post/:id
// desc   ==> Get post by id
// access ==> Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }
    res.send(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
