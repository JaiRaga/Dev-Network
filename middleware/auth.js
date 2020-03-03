const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, config.get("tokenSecret"));
    const user = await User.findOne({ _id: decode._id, "tokens.token": token });

    if (!user) {
      res.status(401).send({ msg: "No user found, Authorization denied" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ msg: "Please Authenticate" });
  }
};

module.exports = auth;
