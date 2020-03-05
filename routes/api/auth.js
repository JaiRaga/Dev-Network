const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const router = express.Router();

// route   GET api/auth

router.get("/", auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// route   POST api/auth

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findByCredentials(email, password);
      if (Object.keys(user)[0] === "errors") {
        return res.status(400).send(user);
      }
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
