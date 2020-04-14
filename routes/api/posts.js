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
  [auth, [check("text", "Text is required").not().isEmpty()]],
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

// route  ==> DELETE /api/posts/:id
// desc   ==> Delete post by id
// access ==> Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).send({ msg: "User not authorized" });
    }

    await post.remove();
    res.send({ msg: "Post removed" });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// route  ==> PATCH /api/posts/like/:id
// desc   ==> Like post by id
// access ==> Private
router.patch("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).send({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.send(post.likes);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// route  ==> PATCH /api/posts/unlike/:id
// desc   ==> Like post by id
// access ==> Private
router.patch("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).send({ msg: "Post has not yet been liked" });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.send(post.likes);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).send({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// route  ==> POST /api/post/comment/:id
// desc   ==> Create a new comment
// access ==> Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      const { avatar, name } = await User.findById(req.user.id);
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).send({ msg: "Post not found" });
      }

      const comment = {
        user: req.user.id,
        text: req.body.text,
        name,
        avatar
      };

      post.comments.unshift(comment);
      await post.save();

      res.send(post.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// route  ==> DELETE /api/post/comment/:p_id/:comment_id
// desc   ==> Delete a comment
// access ==> Private
router.delete("/comment/:p_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.p_id);
    if (!post) {
      return res.status(404).send({ msg: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(404).send({ msg: "Comment does not exists" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).send({ msg: "User not authorized" });
    }

    const removeIndex = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.send(post.comments);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
