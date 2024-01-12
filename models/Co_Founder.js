const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

const co_founderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [50, "Name cannot be bigger than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      maxLength: [10, "Phone number cannot be bigger than 10 numbers"],
      unique: true,
    },
    otp: {
      type: Number,
    },
  },
  { timestamps: true }
);

co_founderSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userid: this._id,
    },
    secret,
    { expiresIn: "30d" }
  );
};

co_founderSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const Co_Founder = mongoose.model("co_founders", co_founderSchema);
module.exports = Co_Founder;
