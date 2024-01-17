const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [50, "Name cannot be bigger than 50 characters"],
    },
    // username: {
    //   type: String,
    //   // required: true,
    //   // unique: true,
    //   // trim: true,
    // },
    email: {
      type: String,
      required: [true, "Please provide a valid email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      // required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      maxLength: [10, "Phone number cannot be bigger than 10 numbers"],
      unique: true,
    },
    image: {
      type: String,
    },
    panNumber: {
      type: String,
      // required: true,
      unique: true,
      match: [
        /^[A-Z]{5}[0-9]{4}[A-Z]$/,
        "Please enter a valid Pan card Number",
      ],
    },
    pincode: {
      type: Number,
      // required: true,
      maxLength: [6, "Pincode cannot be more than 6 digits"],
    },
    completeProfile: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      enum: ["Admin", "User", "Vendor"], default: "User"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    currentLocation: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
    },
    city: {
      type: String,
      // required: true,
    },
    state: {
      type: String,
      // required: true,
    },
    otp: {
      type: Number,
    },
    isDSA: {
      type: Boolean,
      // required: true,
    },
    loans: {
      type: [],
      default: []
    },
    referral_array: {
      type: [String],
      default: []
    },
    referral_link: {
      type: String,
      default: ""
    },
    customer_otp: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userid: this._id,
    },
    secret,
    { expiresIn: "30d" }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model("users", UserSchema);
module.exports = User;
