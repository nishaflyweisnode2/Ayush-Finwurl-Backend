const mongoose = require("mongoose");
const schema = mongoose.Schema;


const leadsSchema = new mongoose.Schema(
  {
    partner: {
      type: schema.Types.ObjectId,
      ref: "users",
    },
    full_name: String,
    lender_bank: String,
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ["Accept", "Reject", "Pending"],
      default: "Pending"
    },
    loanType: [{
      type: schema.Types.ObjectId,
      ref: "subCategory",
    }]

  },
  {
    timestamps: true,
  }
);

const Leads = mongoose.model("leads", leadsSchema);
module.exports = Leads;
