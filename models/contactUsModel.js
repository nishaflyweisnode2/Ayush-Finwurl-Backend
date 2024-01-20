const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
    },
    { timestamps: true }
);

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;
