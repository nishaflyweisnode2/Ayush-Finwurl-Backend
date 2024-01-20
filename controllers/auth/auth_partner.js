const User = require("./../../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;
const encryption = require("./../../func/encryption");
const decryption = require("./../../func/decryption");
const jwt = require('jsonwebtoken');
const Notification = require('./../../models/notificationModel');



const signup_partner = async (req, res) => {
  try {
    const { name, phoneNumber, email, panNumber, referral_link } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (!existingUser) {
      const passString =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&1234567890";
      let userPassword = "";
      for (i = 0; i < 8; i++) {
        let randomSymbol =
          passString[Math.floor(Math.random() * passString.length)];
        userPassword = userPassword + randomSymbol;
      }

      const salt = await bcrypt.genSalt(7);
      const hashedPassword = await bcrypt.hash(userPassword, salt);

      const user = await User.create({
        name: name,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        panNumber: panNumber,
        email: email,
        isDSA: false,
        referral_link: `https://www.finurl.in/authentication/referral/${encryption(
          email
        )}`,
      });

      if (referral_link) {

        const decrypted_email = decryption(referral_link);
        console.log("decrypted_email", decrypted_email)

        const validEmail = decrypted_email.split('-').pop();
        console.log("validEmail", validEmail);

        const referral_user = await User.findOne({ email: validEmail });
        console.log("referral_user", referral_user);
        // const referral_user = await User.findOne({ email: decrypted_email });
        // console.log("referral_user", referral_user)

        if (referral_user) {
          referral_user.referral_array.push(email);
          await referral_user.save();
        } else {
          return res.status(404).json({ message: "Invalid referral link" });
        }
      }
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "no-reply@finurl.in",
          pass: appPassword,
        },
      });

      await transporter.sendMail({
        from: "no-reply@finurl.in",
        to: email,
        subject: "Your FinURL password",
        text: `Hello ${name}! Your unique password is: ${userPassword}`,
      });
      const welcomeMessage = `Welcome, ${user.name}! Thank you for registering.`;
      const welcomeNotification = new Notification({
        userId: user._id,
        title: 'New Notification',
        content: welcomeMessage,
        type: 'welcome',
      });
      await welcomeNotification.save();
      res.status(200).json({ message: "User created", user: user });
    } else {
      res.status(409).json({ message: "User already exists!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const login_partner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loggedInUser = await User.findOne({ email: email });

    if (loggedInUser) {
      const isCorrect = await bcrypt.compare(password, loggedInUser.password);
      if (isCorrect) {
        const otp = 100000 + Math.floor(Math.random() * 900000);
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "no-reply@finurl.in",
            pass: appPassword,
          },
        });

        await transporter.sendMail({
          from: "no-reply@finurl.in",
          to: email,
          subject: "Your FinURL password",
          text: `Hello ! Your unique OTP is: ${otp}`,
        });
        if (loggedInUser.referral_link == "") {
          loggedInUser.referral_link = `https://www.finurl.in/authentication/referral/${encryption(
            email
          )}`;
          await loggedInUser.save();
        }
        await User.findOneAndUpdate(
          { _id: loggedInUser._id },
          { $set: { otp: otp } }
        );
        res.status(200).json({ message: "OTP sent to the user" });
      } else {
        res.status(401).json({ error: "Invalid Password" });
      }
    } else {
      res.status(400).json({ msg: "No such user exists!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verify_otp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const loggedInUser = await User.findOne({ email: email });
    if (loggedInUser.otp == otp) {
      // const token = await loggedInUser.createJWT();
      const token = jwt.sign({ _id: loggedInUser._id }, 'FINURL_98', { expiresIn: '365d' });
      console.log("token", token);
      await User.findOneAndUpdate(
        { email: email },
        {
          $set: {
            otp: null,
          },
        }
      );
      res.status(200).json({
        msg: "User Logged In Successfully!",
        token: token,
        user: loggedInUser,
        isDSA: loggedInUser.isDSA,
      });
    } else {
      res.status(403).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup_partner,
  login_partner,
  verify_otp,
};
