const User = require("../../models/User");
const jwt = require('jsonwebtoken');


const dashboard1 = async (req, res) => {
  try {
    const loggedInUserId = req.headers.authorization.split(" ")[1];
    console.log("loggedInUserId", loggedInUserId);
    const loggedInUser = await User.findOne({ _id: loggedInUserId });
    console.log("loggedInUser", loggedInUser);

    if (!loggedInUser) {
      res.status(404).json({ error: "No such user found" });
    } else {
      res.status(200).json({ loans: loggedInUser.loans });
    }
  } catch (error) {
    console.log(error);
  }
};


const dashboard = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);

    const userId = decoded._id;
    console.log("userId", userId);

    const loggedInUser = await User.findOne({ _id: userId });
    if (!loggedInUser) {
      res.status(404).json({ error: "No such user found" });
    } else {
      res.status(200).json({ loans: loggedInUser.loans });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// send_user_otp ?
// verify_user_otp?
// hash_referral_link?
// dehash_referral_link?

module.exports = {
  dashboard,
};
