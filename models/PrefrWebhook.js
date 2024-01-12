const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    data: {
      rejectReason: [
        {
          type: String
        }
      ],
      lan: Number,
      selectedOfferDetails: {
        loanAmount: Number,
        roi: Number,
        tenure: Number,
        emi: Number,
        preEmiInterest: Number,
        finalProcessingFee: Number,
        firstEmiAmount: Number,
        firstEmiDate: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Webhook = mongoose.model("loans", webhookSchema);
module.exports = Webhook;
