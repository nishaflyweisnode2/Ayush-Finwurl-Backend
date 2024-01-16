const User = require("./../../models/User");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;
const jwt = require('jsonwebtoken');
require("dotenv").config();
const Notification = require('./../../models/notificationModel');
const LoanApply = require('./../../models/loanApplyModel');
const LoanDetails = require('./../../models/loanDetailsmodel');
const UserDetails = require('./../../models/userDetailsModel');

exports.signup_user = async (req, res) => {
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

      const welcomeMessage = `Welcome, ${user.name}! Thank you for registering.`;
      const welcomeNotification = new Notification({
          userId: user._id,
          title: 'New Notification',
          content: welcomeMessage,
          type: 'welcome',
      });
      await welcomeNotification.save();

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

exports.createUserDetails = async (req, res) => {
  try {
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ status: 404, message: 'User not found' });
      }

      const {
          firstName,
          middleName,
          lastName,
          gender,
          maritalStatus,
          dateOfBirth,
      } = req.body;

      let userDetails = await UserDetails.findOne({ user: userId });

      if (!userDetails) {
          userDetails = new UserDetails({
              user: userId,
              name: {
                  firstName,
                  middleName,
                  lastName,
              },
              gender,
              maritalStatus,
              dateOfBirth,
          });

          await userDetails.save();
      } else {
          userDetails.name.firstName = firstName;
          userDetails.name.middleName = middleName;
          userDetails.name.lastName = lastName;
          userDetails.gender = gender;
          userDetails.maritalStatus = maritalStatus;
          userDetails.dateOfBirth = dateOfBirth;

          await userDetails.save();
      }

      res.status(200).json({ message: 'UserDetails created/updated successfully', userDetails });
  } catch (error) {
      console.error('Error creating/updating UserDetails:', error);
      res.status(500).json({ error: error.message });
  }
};

exports.uploadIdPicture = async (req, res) => {
  try {
      const userId = req.user._id;

      if (!req.file) {
          return res.status(400).json({ status: 400, error: "Image file is required" });
      }

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { image: req.file.path },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ status: 404, message: 'User not found' });
      }

      return res.status(200).json({ status: 200, message: 'Uploaded successfully', data: updatedUser });
  } catch (error) {
      return res.status(500).json({ message: 'Failed to upload profile picture', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
      const user = await User.findOne({ _id: req.user._id });
      if (!user) {
          return res.status(404).send({ status: 404, message: "User not found" });
      }

      let updateFields = {};

      if (req.body.currentLat || req.body.currentLong) {
          const coordinates = [parseFloat(req.body.currentLat), parseFloat(req.body.currentLong)];
          updateFields.currentLocation = { type: "Point", coordinates };
      }

      if (req.body.state) {
          updateFields.state = req.body.state;
          updateFields.isState = true;
      }

      if (req.body.city) {
          updateFields.city = req.body.city;
          updateFields.isCity = true;
      }

      const updatedUser = await User.findByIdAndUpdate(
          { _id: user._id },
          { $set: updateFields },
          { new: true }
      );

      if (updatedUser) {
          let obj = {
              currentLocation: updatedUser.currentLocation,
              state: updatedUser.state,
              city: updatedUser.city,
          };
          return res.status(200).send({ status: 200, message: "Location update successful.", data: obj });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).send({ status: 500, message: "Server error" + error.message });
  }
};

exports.editProfile = async (req, res) => {
  try {
      const userId = req.user._id;

      const { name, password, email, phoneNumber } = req.body;

      const updateObject = {};
      if (name) updateObject.name = name;
      if (password) updateObject.password = password;
      if (email) updateObject.email = email;
      if (phoneNumber) updateObject.phoneNumber = phoneNumber;

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateObject },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ status: 404, message: 'User not found' });
      }

      return res.status(200).json({ status: 200, message: 'Edit Profile updated successfully', data: updatedUser });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
      const userId = req.user._id;

      const user = await User.findById(userId).populate('city');
      if (!user) {
          return res.status(404).json({ status: 404, message: 'User not found' });
      }

      const memberSince = user.createdAt.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
      });

      return res.status(200).json({
          status: 200,
          data: {
              user,
              memberSince,
          },
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
};

exports.getUserProfileById = async (req, res) => {
  try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ status: 404, message: 'User not found' });
      }

      const memberSince = user.createdAt.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
      });

      return res.status(200).json({
          status: 200, data: {
              user,
              memberSince,
          },
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
};

const calculateMonthlyPayment = (loanAmount, annualInterestRate, loanTermMonths, additionalFees) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const totalLoanAmount = loanAmount + additionalFees;

  const monthlyPayment =
      (totalLoanAmount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths));

  return monthlyPayment;
};

exports.calculateLoan = async (req, res) => {
  try {
      const { loanAmount, annualInterestRate, loanTermMonths, additionalFees } = req.body;

      const loanDetails = new LoanDetails({
          loanAmount,
          annualInterestRate,
          loanTermMonths,
          additionalFees,
      });

      await loanDetails.save();

      const monthlyPayment = calculateMonthlyPayment(
          loanAmount,
          annualInterestRate,
          loanTermMonths,
          additionalFees
      );
      const roundedMonthlyPayment = Math.round(monthlyPayment * 100) / 100;

      res.status(200).json({ status: 200, data: roundedMonthlyPayment });
  } catch (error) {
      console.error('Error calculating loan:', error);
      res.status(500).json({ error: error.message });
  }
};

exports.getAllLoanDetails = async (req, res) => {
  try {
      const allLoanDetails = await LoanApply.find();
      return res.status(200).json({ status: 200, data: allLoanDetails });
  } catch (error) {
      console.error('Error getting all loan details:', error);
      return res.status(500).json({ status: 500, error: error.message });
  }
};

exports.getLoanDetailById = async (req, res) => {
  try {
      const loanDetail = await LoanApply.findById(req.params.id);
      if (!loanDetail) {
          return res.status(404).json({ status: 404, message: 'Loan detail not found' });
      }
      return res.status(200).json({ status: 200, data: loanDetail });
  } catch (error) {
      console.error('Error getting loan detail by ID:', error);
      return res.status(500).json({ status: 500, error: error.message });
  }
};


// module.exports = {
//   signup_user,
// };
