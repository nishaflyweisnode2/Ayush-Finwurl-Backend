const User = require("../../models/User");

const dashboard = async (req, res) => {
  try {
    const loggedInUserId = req.headers.authorization.split(" ")[1];
    console.log("loggedInUserId", loggedInUserId);
    const loggedInUser = await User.findOne({ _id: loggedInUserId });
    if (!loggedInUser) {
      res.status(404).json({ error: "No such user found" });
    } else {
      res.status(200).json({ loans: loggedInUser.loans });
    }
  } catch (error) {
    console.log(error);
  }
};

// send_user_otp ?
// verify_user_otp?
// hash_referral_link?
// dehash_referral_link?

module.exports = {
  dashboard,
};
