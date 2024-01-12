const axios = require("axios");
const User = require("./../../models/User");
const key = process.env.OTP_KEY;
const campaign = process.env.CAMPAIGN;
const route_id = process.env.ROUTE_ID;
const type = process.env.TYPE;
const sender_id = process.env.SENDER_ID;
const template_id = process.env.TEMPLATE_ID;
const pe_id = process.env.PE_ID;

const send_otp_to_customer = async (req, res) => {
  try {
    const { contact, email } = req.body;
    const otp = 100000 + Math.floor(Math.random() * 900000);
    const message = `${otp} is your OTP to login to FinURL. DO NOT share with anyone.FinURL never calls to ask for OTP. The otp expires in 10 mins.-FinURL`;
    const url = `https://kutility.org/app/smsapi/index.php?key=${key}&campaign=${campaign}&routeid=${route_id}&type=${type}&contacts=${contact}&senderid=${sender_id}&msg=${message}&template_id=${template_id}&pe_id=${pe_id}`;
    const response = await axios.get(url);
    if (response.status === 200) {
      const user = await User.findOne({ email: email });
      if (user) {
        user.customer_otp = otp;
        await user.save();
        res.status(200).json({ message: "OTP sent successfully!" });
      } else {
        res.status(404).json({message: "No such user found"})
      }
    } else {
      res
        .status(400)
        .json({
          message: "There was an error sending the OTP. Please try again!",
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const verify_customer_otp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "No such user found" });
    } 
    else {
      if (otp == user.customer_otp) {
        res.status(200).json({ message: "OTP verified successfully!" });
      } else {
        res.status(400).json({ message: "Invalid OTP! Please try again" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = {
  send_otp_to_customer,
  verify_customer_otp,
};
