const User = require("./../../models/User");
const UserDetails = require('./../../models/userDetailsModel');
const LoanDetails = require('./../../models/loanDetailsmodel');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;
const encryption = require("./../../func/encryption");
const decryption = require("./../../func/decryption");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const Notification = require('../../models/notificationModel');





exports.register = async (req, res) => {
    try {
        const { name, phoneNumber, email, password } = req.body;

        const existingUserByMobile = await User.findOne({ phoneNumber });
        if (existingUserByMobile) {
            return res.status(400).json({ status: 400, message: 'User already exists with this mobile number' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ status: 400, message: 'User already exists with this email' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const referId = Math.floor(100000 + Math.random() * 900000);
        const referralCode = referId;

        const user = new User({
            name,
            phoneNumber,
            otp: generateOtp(),
            referralCode,
            userType: "Admin",
            email,
            password: hashedPassword
        });

        await user.save();

        const welcomeMessage = `Welcome, ${user.name}! Thank you for registering.`;
        const welcomeNotification = new Notification({
            recipient: user._id,
            content: welcomeMessage,
            type: 'welcome',
        });
        await welcomeNotification.save();


        return res.status(201).json({ status: 201, message: 'User registered successfully', data: user });
    } catch (error) {
        return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;


        const user = await User.findOne({ email, userType: "Admin" });

        if (!user) {
            return res.status(401).json({ status: 401, message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: 'Invalid password' });
        }

        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });

        return res.status(200).json({ status: 200, message: 'Login successful', token, data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Login failed', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(/*{ userType: 'User' }*/);
        const count = users.length;
        return res.status(200).json({ status: 200, data: count, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching users', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error fetching user', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({ status: 200, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error deleting user', error: error.message });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { image: req.file.path, }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, message: 'Profile picture uploaded successfully', data: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to upload profile picture', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { error } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (req.body.userName) {
            user.userName = req.body.userName;
        }
        if (req.body.mobileNumber) {
            user.mobileNumber = req.body.mobileNumber;
        }

        if (req.body.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            user.password = hashedPassword;
        }

        await user.save();

        return res.status(200).json({ status: 200, message: 'User details updated successfully', data: user });
    } catch (error) {
        return res.status(500).json({ message: 'User details update failed', error: error.message });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }

        const createNotification = async (userId) => {
            const notificationData = {
                userId,
                title: req.body.title,
                content: req.body.content,
            };
            return await Notification.create(notificationData);
        };

        if (req.body.total === "ALL") {
            const userData = await User.find({ userType: req.body.sendTo });
            if (userData.length === 0) {
                return res.status(404).json({ status: 404, message: "Users not found" });
            }

            for (const user of userData) {
                await createNotification(user._id);
            }

            await createNotification(admin._id);

            return res.status(200).json({ status: 200, message: "Notifications sent successfully to all users." });
        }

        if (req.body.total === "SINGLE") {
            const user = await User.findById(req.body._id);
            if (!user || user.userType !== req.body.sendTo) {
                return res.status(404).json({ status: 404, message: "User not found or invalid user type" });
            }

            const notificationData = await createNotification(user._id);

            return res.status(200).json({ status: 200, message: "Notification sent successfully.", data: notificationData });
        }

        return res.status(400).json({ status: 400, message: "Invalid 'total' value" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error", data: {} });
    }
};

exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ recipient: userId });

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    const notificationId = req.params.id;

    try {
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        return res.status(200).json({ status: 200, message: 'Notification deleted successfully', data: deletedNotification });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error deleting notification', error: error.message });
    }
};
