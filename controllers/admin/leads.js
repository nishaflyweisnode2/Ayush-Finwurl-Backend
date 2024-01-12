const Leads = require("../../models/Leads");
const User = require("../../models/User");

const addLeads = async (req, res) => {
  try {
    const {
      loggedInUserId,
      partner,
      full_name,
      phone_number,
      pan_number,
      aadhar_number,
      lender_bank,
      amount,
    } = req.body;

    const duplicate_lead = await Leads.findOne({
      $or: [
        { aadhar_number: aadhar_number },
        { pan_number: pan_number },
        { phone_number: phone_number },
      ],
    });
    if (duplicate_lead) {
      res
        .status(400)
        .json({ message: "Lead for the above data is already punched!" });
    } else {
      await Leads.create({
        partner: partner,
        full_name: full_name,
        phone_number: phone_number,
        pan_number: pan_number,
        aadhar_number: aadhar_number,
        lender_bank: lender_bank,
        amount: amount,
      });
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: loggedInUserId,
          loans: {
            $elemMatch: { pan_number: pan_number },
          },
        },
        { $set: { "loans.$.punched": true } },
        { new: true }
      );

      console.log(updatedUser)
      res.status(200).json({ message: "Lead punched successfully!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong!");
  }
};

const getLeads = async (req, res) => {
  try {
    const allLeads = await Leads.find({});
    res.status(200).json(allLeads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = {
  addLeads,
  getLeads,
};
