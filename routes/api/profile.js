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

// route  ==> PATCH /api/profile/experience
// desc   ==> add/update user's experience
// access ==> Private
router.patch(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const newExp = { ...req.body };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.send(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// route  ==> PATCH /api/profile/education
// desc   ==> add/update user's education
// access ==> Private
router.patch(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("field", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const newEdu = { ...req.body };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.send(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// route  ==> DELETE /api/profile/experience/:exp_id
// desc   ==> Delete user profile's experience
// access ==> Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.send(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// route  ==> DELETE /api/profile/education/:exp_id
// desc   ==> Delete user profile's education
// access ==> Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();

    res.send(profile);
  } catch (err) {
    console.log(err.message);
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
