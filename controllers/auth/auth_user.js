const User = require("./../../models/User");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;
const jwt = require('jsonwebtoken');
require("dotenv").config();
const Notification = require('./../../models/notificationModel');
const LoanApply = require('./../../models/loanApplyModel');
const LoanDetails = require('./../../models/loanDetailsmodel');
const UserDetails = require('./../../models/userDetailsModel');
const EligibilityCheck = require('./../../models/checkEligibilityMobel');
const FinancialTerm = require('./../../models/creditInfoModel');
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');
const Banner = require('../../models/bannerModel');
const RatingReview = require('../../models/ratingModel');



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

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ status: 200, data: categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching categories', error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching category', error: error.message });
    }
};

exports.getSubCategories = async (req, res) => {
    let findCategory = await Category.findOne({ _id: req.params.categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await SubCategory.find({ categoryId: findCategory._id, }).populate('name').populate('categoryId', 'name')
        if (findSubCategory.length > 0) {
            return res.status(200).json({ message: "Sub Category Found", status: 200, data: findSubCategory, });
        } else {
            return res.status(201).json({ message: "Sub Category not Found", status: 404, data: {}, });
        }
    }
};

exports.getAllSubCategories = async (req, res) => {
    let findSubCategory = await SubCategory.find().populate('name').populate('categoryId', 'name')
    if (findSubCategory.length > 0) {
        return res.status(200).json({ message: "Sub Category Found", status: 200, data: findSubCategory, });
    } else {
        return res.status(201).json({ message: "Sub Category not Found", status: 404, data: {}, });
    }
};

exports.createEligibilityCheck = async (req, res) => {
    try {
        const {
            fullName,
            email,
            mobileNumber,
            panNumber,
            dob,
            accountNumber,
            income,
            pinCode,
            category,
            subCategory,
        } = req.body;

        const eligibilityCheck = await EligibilityCheck.create({
            fullName,
            email,
            mobileNumber,
            panNumber,
            dob,
            accountNumber,
            income,
            pinCode,
            category,
            subCategory,
        });

        res.status(201).json({ status: 201, message: 'Eligibility Check created successfully', data: eligibilityCheck });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.getAllEligibilityChecks = async (req, res) => {
    try {
        const eligibilityChecks = await EligibilityCheck.find().populate('category subCategory');

        const count = eligibilityChecks.length;

        return res.status(200).json({ status: 200, data: count, eligibilityChecks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching eligibility checks', error: error.message });
    }
};

exports.getEligibilityCheckById = async (req, res) => {
    try {
        const eligibilityCheck = await EligibilityCheck.findById(req.params.id).populate('category subCategory');

        if (!eligibilityCheck) {
            return res.status(404).json({ status: 404, message: 'Eligibility Check not found' });
        }

        return res.status(200).json({ status: 200, data: eligibilityCheck });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching eligibility check', error: error.message });
    }
};

exports.updateEligibilityCheckById = async (req, res) => {
    try {
        const updatedEligibilityCheck = await EligibilityCheck.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category subCategory');

        if (!updatedEligibilityCheck) {
            return res.status(404).json({ status: 404, message: 'Eligibility Check not found' });
        }

        return res.status(200).json({ status: 200, message: 'Eligibility Check updated successfully', data: updatedEligibilityCheck });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.deleteEligibilityCheckById = async (req, res) => {
    try {
        const deletedEligibilityCheck = await EligibilityCheck.findByIdAndDelete(req.params.id);

        if (!deletedEligibilityCheck) {
            return res.status(404).json({ status: 404, message: 'Eligibility Check not found' });
        }

        return res.status(200).json({ status: 200, message: 'Eligibility Check deleted successfully', data: deletedEligibilityCheck });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.getAllFinancialTerms = async (req, res) => {
    try {
        const financialTerms = await FinancialTerm.find().populate('category');
        return res.status(200).json({ status: 200, data: financialTerms });
    } catch (error) {
        console.error('Error fetching financial terms:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getFinancialTermById = async (req, res) => {
    try {
        const { termId } = req.params;
        const financialTerm = await FinancialTerm.findOne({ _id: termId }).populate('category');

        if (!financialTerm) {
            return res.status(404).json({ status: 404, message: 'Financial term not found' });
        }

        return res.status(200).json({ status: 200, data: financialTerm });
    } catch (error) {
        console.error('Error fetching financial term:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find();
        return res.status(200).json({ status: 200, message: 'Banners retrieved successfully', data: banners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.getBannerById = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const banner = await Banner.findById(bannerId);

        if (!banner) {
            return res.status(404).json({ status: 404, message: 'Banner not found' });
        }

        return res.status(200).json({ status: 200, message: 'Banner retrieved successfully', data: banner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.createRatingReview = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const { rating, review } = req.body;

        const newRatingReview = new RatingReview({ user: user._id, rating, review });
        const savedRatingReview = await newRatingReview.save();

        return res.status(201).json({ status: 201, data: savedRatingReview, message: 'Rating and review created successfully' });
    } catch (error) {
        console.error('Error creating rating and review:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllRatingReviews = async (req, res) => {
    try {
        const ratingReviews = await RatingReview.find();

        return res.status(200).json({ status: 200, data: ratingReviews });
    } catch (error) {
        console.error('Error fetching rating and reviews:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getRatingReviewById = async (req, res) => {
    try {
        const ratingReview = await RatingReview.findById(req.params.id);

        if (!ratingReview) {
            return res.status(404).json({ status: 404, message: 'Rating and review not found' });
        }

        return res.status(200).json({ status: 200, data: ratingReview });
    } catch (error) {
        console.error('Error fetching rating and review by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateRatingReviewById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const { rating, review } = req.body;

        const updatedRatingReview = await RatingReview.findByIdAndUpdate(
            req.params.id,
            { rating, review },
            { new: true }
        );

        if (!updatedRatingReview) {
            return res.status(404).json({ status: 404, message: 'Rating and review not found' });
        }

        return res.status(200).json({ status: 200, data: updatedRatingReview, message: 'Rating and review updated successfully' });
    } catch (error) {
        console.error('Error updating rating and review by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteRatingReviewById = async (req, res) => {
    try {
        const deletedRatingReview = await RatingReview.findByIdAndDelete(req.params.id);

        if (!deletedRatingReview) {
            return res.status(404).json({ status: 404, message: 'Rating and review not found' });
        }

        return res.status(200).json({ status: 200, data: deletedRatingReview, message: 'Rating and review deleted successfully' });
    } catch (error) {
        console.error('Error deleting rating and review by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};


// module.exports = {
//   signup_user,
// };
