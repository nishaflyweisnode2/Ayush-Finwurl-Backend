const User = require("./../../models/User");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;

const signup_user = async (req, res) => {
  try {
    const { name, phoneNumber, email, panNumber } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (!existingUser) {
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
        subject: "Your FinURL password",
        text: `Hello ${name}! Your unique OTP is: ${userOTP}`,
      });

      const user = await User.create({
        name: name,
        phoneNumber: phoneNumber,
        panNumber: panNumber,
        email: email,
        isDSA: true,
      });

      res
        .status(200)
        .json({ message: "User created", user: user, isDSA: user.isDSA });
    } else {
      res.status(409).json({ message: "User already exists!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  signup_user,
};
