//8.2.4 - create a new file - posts.js

//import statements
const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");

//import model schemas
const Post = require("../../models/Post");
//const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route  GET api/posts
// @desc   Test route
// @access Public
//single end-point for initial test of route
//router.get("/", (req, res) => {});

// @route  Post api/posts
// @desc   Create a post
// @access Private

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
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //we are logged in so we can use req to get user id
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route  GET api/posts
// @desc   Get all posts
// @access Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route  GET api/posts/:id
// @desc   Get a post by id
// @access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route  Delete api/posts/:id
// @desc   Get a post by id
// @access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //check if user is authorized to delete a post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route  PUT api/posts/unlike/:id
// @desc   Unlike a post
// @access Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    //create an instance
    const post = await Post.findById(req.params.id);
    //checked if post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post has not been liked" });
    }
    //get the remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    //save to database
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route  PUT api/posts/like/:id
// @desc   Like a post
// @access Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    //create an instance
    const post = await Post.findById(req.params.id);
    //checked if post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    //save to database
    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route  Post api/posts/comment/:id
// @desc   Comment on a post
// @access Private

router.post(
  "/comment/:id",
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
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //we are logged in so we can use req to get user id
      const user = await User.findById(req.user.id).select("-password");
      //get post by id: id from url so req,params,id
      const post = await Post.findById(req.params.id).select("-password");

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };
      post.comments.unshift(newComment);
      //save to db
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete a comment
// @access Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    //get post by id: id from url so req,params,id
    const post = await Post.findById(req.params.id).select("-password");

    //pull out comments from post
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    //make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "comment doesn't exist" });
    }
    //make sure user authorized to delete a comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }

    //get the remove index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    //save to database
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
