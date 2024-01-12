const mongoose = require("mongoose");

const leadsSchema = new mongoose.Schema(
  {
    partner: String,
    full_name: String,
    phone_number: String,
    pan_number: String,
    aadhar_number: String,
    lender_bank: String,
    amount: Number,
  },
  {
    timestamps: true,
  }
);

const Leads = mongoose.model("leads", leadsSchema);
module.exports = Leads;
