const axios = require("axios");
const User = require("../../models/User");

const prefrWebhook = async (req, res) => {
  const { loanId, eventName, data } = req.body;
  console.log(loanId);

  try {
    const allUsers = await User.find({});
    const partner = allUsers.filter((user) =>
      user.loans.some((loan) => loan.loanId === loanId)
    );
    let found_partner = partner[0].name;

    console.log(found_partner);

    if (found_partner) {
      await User.updateOne(
        { name: found_partner, "loans.loanId": loanId },
        {
          $set: {
            "loans.$.eventName": eventName,
            "loans.$.data": data,
          },
        }
      );

      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ message: "No User found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: "Someting went wrong" });
  }
};

module.exports = {
  prefrWebhook,
};
