const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;

const reset_password_send_otp = async (req, res) => {
    try {
      const { email } = req.body;
      console.log(email);
  
      const user = await User.findOne({ email: email });
  
      if (!user) {
        res.status(404).json({ message: "User does not exist" });
      } else {
        const otpString = "1234567890";
        let userOTP = "";
        for (i = 0; i < 6; i++) {
          let randomSymbol =
            otpString[Math.floor(Math.random() * otpString.length)];
          userOTP = userOTP + randomSymbol;
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
          subject: "Your FinURL Reset Password OTP",
          text: `Hello ${user.name}! Your unique OTP is: ${userOTP}`,
        });
        await User.findOneAndUpdate(
          { email: email },
          {
            $set: {
              otp: Number(userOTP),
            },
          }
        );
        res.status(200).json({ message: "OTP sent to the registered email" });
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const reset_pass_verify_otp = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email: email });
      if (user.otp == otp) {
        await User.findOneAndUpdate(
          { email: email },
          {
            $set: {
              otp: "",
            },
          }
        );
        res.status(200).json({ message: "OTP verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid OTP! Please try again" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const reset_password = async (req, res) => {
    try {
      const { email, new_password } = req.body;
      const salt = await bcrypt.genSalt(7);
      const hashedPassword = await bcrypt.hash(new_password, salt);
      const user = await User.findOneAndUpdate(
        { email: email },
        {
          password: hashedPassword,
        }
      );
      if (!user) res.status(404).json({ message: "User not found" });
      else res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
      console.log(error);
    }
  };

  module.exports = {
    reset_password_send_otp,
    reset_pass_verify_otp,
    reset_password,
  };
  