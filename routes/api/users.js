const express = require("express");
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");

const router = express.Router();

const User = require("../../models/User");

// route   POST api/users

router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email!").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if the user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // Get Users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "retro"
      });

      user = new User({
        name,
        email,
        password,
        avatar
      });

      // Encrypt Password
      await user.save();

      // returns jwt
      const token = await user.generateAuthToken();

      res.send({ user, token });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
