const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    aggrementImage: {
        type: String,
    },
    softImage: {
        type: String,
    },
    date: {
        type: Date,
    },
    status: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Partner", PartnerSchema);