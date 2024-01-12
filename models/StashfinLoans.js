const mongoose = require("mongoose");

const stashfinWebhookSchema = new mongoose.Schema(
  {
    punched: { type: Boolean, default: false },
    status: Boolean,
    results: {
      application_id: String,
      application_status: String,
      offer_details: {
        amount: Number,
        tenure: Number,
        roi: Number,
        processing_fee_rate: Number,
        emi: Number,
        spdc_amount: Number,
        disbursal_amount: Number,
        first_emi_date: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const StashfinWebhook = mongoose.model("stashfin_loans", stashfinWebhookSchema);
module.exports = StashfinWebhook;
