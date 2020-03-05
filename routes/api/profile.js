const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const router = express.Router();

// route  ==> GET /api/profile/me
// desc   ==> get current users profile
// access ==> Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id
    }).populate("user", ["name", "avatar"]);

    // await profile.populate("user", ["name", "avatar"]);

    if (!profile) {
      return res
        .status(400)
        .send({ msg: "There is no profile for this user." });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// route  ==> POST /api/profile
// desc   ==> Create user profile
// access ==> Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    // console.log(req.body);

    try {
      // Update Profile
      let profile = await Profile.findOne({ user: req.user._id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user },
          { ...req.body },
          {
            new: true
          }
        );
        profile.social = { ...req.body };
        profile.skills = req.body.skills.split(",").map(skill => skill.trim());
        await profile.save();

        return res.status(200).send(profile);
      }

      profile = await Profile({ ...req.body, user: req.user._id });
      profile.social = { ...req.body };
      profile.skills = req.body.skills.split(",").map(skill => skill.trim());

      await profile.save();
      res.status(201).send(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// route  ==> GET /api/profile
// desc   ==> Get all user profile
// access ==> Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.status(200).send(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// route  ==> GET /api/profile/user/user_id
// desc   ==> Get user profile by ID
// access ==> Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).send({ msg: "Profile not found" });
    }
    res.status(200).send(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).send({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// route  ==> DELETE /api/profile
// desc   ==> Delete user profile
// access ==> Private
router.delete("/", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.status(200).send(req.user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
