const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Co_Founder = require("./../../models/Co_Founder");
const appPassword = process.env.EMAIL_APP_PASSWORD;

const login_cofounder = async (req, res) => {
    try {
      const { email, password } = req.body;
      const loggedInUser = await Co_Founder.findOne({ email: email });
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
          await Co_Founder.findOneAndUpdate(
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
  
  const login_cofounder_verify_otp = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const loggedInUser = await Co_Founder.findOne({ email: email });
      if (loggedInUser.otp == otp) {
        const token = await loggedInUser.createJWT();
        await Co_Founder.findOneAndUpdate(
          { email: email },
          {
            $set: {
              otp: "",
            },
          }
        );
        res.status(200).json({
          msg: "Co-Founder Logged In Successfully!",
          token: token,
          user: loggedInUser,
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
    login_cofounder,
    login_cofounder_verify_otp,
  };
  