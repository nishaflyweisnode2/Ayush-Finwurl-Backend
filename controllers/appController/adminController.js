const User = require("./../../models/User");
const UserDetails = require('./../../models/userDetailsModel');
const LoanDetails = require('./../../models/loanDetailsmodel');
const LoanApply = require('./../../models/loanApplyModel');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const appPassword = process.env.EMAIL_APP_PASSWORD;
const encryption = require("./../../func/encryption");
const decryption = require("./../../func/decryption");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const Notification = require('../../models/notificationModel');
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');
const Banner = require('../../models/bannerModel');
const FinancialTerm = require('../../models/creditInfoModel');





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

        // const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: process.env.ACCESS_TOKEN_TIME });
        const token = jwt.sign({ _id: user._id }, 'FINURL_98', { expiresIn: '365d' });

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

exports.createLoanDetail = async (req, res) => {
    try {
        const { mainTitle, mainDescription, title, description } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const newLoanDetail = new LoanApply({
            mainTitle,
            mainDescription,
            title,
            description,
            image: req.file.path,
        });

        const savedLoanDetail = await newLoanDetail.save();

        return res.status(201).json({ status: 201, data: savedLoanDetail });
    } catch (error) {
        console.error('Error creating loan detail:', error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.updateLoanDetailById = async (req, res) => {
    try {
        const { mainTitle, mainDescription, title, description } = req.body;

        let updatedData
        if (req.file) {
            updatedData = req.file.path
        }

        const updatedLoanDetail = await LoanApply.findByIdAndUpdate(
            req.params.id,
            { mainTitle, mainDescription, title, description, image: updatedData },
            { new: true }
        );

        if (!updatedLoanDetail) {
            return res.status(404).json({ status: 404, message: 'Loan detail not found' });
        }

        return res.status(200).json({ status: 200, data: updatedLoanDetail });
    } catch (error) {
        console.error('Error updating loan detail by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
}

exports.deleteLoanDetailById = async (req, res) => {
    try {
        const deletedLoanDetail = await LoanApply.findByIdAndDelete(req.params.id);
        if (!deletedLoanDetail) {
            return res.status(404).json({ status: 404, message: 'Loan detail not found' });
        }
        return res.status(200).json({ status: 200, message: 'Loan detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting loan detail by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {

        const { name, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const category = new Category({
            name,
            status,
            image: req.file.path,
        });

        await category.save();

        return res.status(201).json({ status: 201, message: 'Category created successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category creation failed', error: error.message });
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

exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const findCategory = await Category.findById(categoryId);
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }

        let obj = {
            name: req.body.name || findCategory.name,
            status: req.body.status || findCategory.status,
            description: req.body.description || findCategory.description,
            image: fileUrl || findCategory.image,

        }
        const category = await Category.findByIdAndUpdate({ _id: categoryId }, { $set: obj }, { new: true });

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Category updated successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category update failed', error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category deletion failed', error: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const { title, description, isActive } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const newBanner = await Banner.create({
            title,
            description,
            image: req.file.path,
            isActive,
        });

        return res.status(201).json({ status: 201, message: 'Banner created successfully', data: newBanner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
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

exports.updateBannerById = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const updateFields = req.body;

        if (req.file) {
            updateFields.image = req.file.path;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(bannerId, updateFields, { new: true });

        if (!updatedBanner) {
            return res.status(404).json({ status: 404, message: 'Banner not found' });
        }

        return res.status(200).json({ status: 200, message: 'Banner updated successfully', data: updatedBanner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.deleteBannerById = async (req, res) => {
    try {
        const bannerId = req.params.id;

        const deletedBanner = await Banner.findByIdAndDelete(bannerId);

        if (!deletedBanner) {
            return res.status(404).json({ status: 404, message: 'Banner not found' });
        }

        return res.status(200).json({ status: 200, message: 'Banner deleted successfully', data: deletedBanner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.createSubCategory = async (req, res) => {
    try {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findSubCategory = await SubCategory.findOne({ categoryId: findCategory._id, name: req.body.name });
            if (findSubCategory) {
                return res.status(409).json({ message: "Sub Category already exit.", status: 404, data: {} });
            } else {
                let fileUrl;
                if (req.file) {
                    fileUrl = req.file ? req.file.path : "";
                }
                const data = { categoryId: findCategory._id, name: req.body.name, image: fileUrl, description: req.body.description, colourPicker: req.body.colourPicker, status: req.body.status };
                const category = await SubCategory.create(data);
                return res.status(200).json({ message: "Sub Category add successfully.", status: 200, data: category });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
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

exports.updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await SubCategory.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    }
    if (req.body.categoryId != (null || undefined)) {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
        status: req.body.status || findSubCategory.status,
        description: req.body.description || findSubCategory.description,
        image: fileUrl || findSubCategory.image,

    }
    let update = await SubCategory.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};

exports.removeSubCategory = async (req, res) => {
    const { id } = req.params;
    const category = await SubCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await SubCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};

exports.createFinancialTerm = async (req, res) => {
    try {
        const { category, name, description } = req.body;

        let images = [];
        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                images.push(obj);
            }
        }

        const newTerm = await FinancialTerm.create({
            category,
            name,
            description,
            images,
        });

        res.status(201).json({ status: 201, message: 'Financial term created successfully', data: newTerm });
    } catch (error) {
        console.error('Error creating financial term:', error);
        res.status(500).json({ status: 500, error: error.message });
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

exports.updateFinancialTerm = async (req, res) => {
    try {
        const { termId } = req.params;
        const { name, description, category } = req.body;

        let updatedFields = { images: [] };

        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                updatedFields.images.push(obj);
            }
        }

        if (name) {
            updatedFields.name = name;
        }

        if (description) {
            updatedFields.description = description;
        }

        if (category) {
            updatedFields.category = category;
        }

        const updatedTerm = await FinancialTerm.findOneAndUpdate(
            { _id: termId },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedTerm) {
            return res.status(404).json({ status: 404, message: 'Financial term not found' });
        }

        res.status(200).json({ status: 200, message: 'Financial term updated successfully', data: updatedTerm });
    } catch (error) {
        console.error('Error updating financial term:', error);
        res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteFinancialTerm = async (req, res) => {
    try {
        const { termId } = req.params;

        const deletedTerm = await FinancialTerm.findOneAndDelete({ _id: termId });

        if (!deletedTerm) {
            return res.status(404).json({ status: 404, message: 'Financial term not found' });
        }

        return res.status(200).json({ status: 200, message: 'Financial term deleted successfully' });
    } catch (error) {
        console.error('Error deleting financial term:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateFinancialTermImageFileById = async (req, res) => {
    try {
        const { termId, imageId } = req.params;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const updatedTerm = await FinancialTerm.findOneAndUpdate(
            { _id: termId, 'images._id': imageId },
            { $set: { 'images.$.img': req.file.path } },
            { new: true }
        );

        if (!updatedTerm) {
            return res.status(404).json({ status: 404, message: 'Financial term or image not found' });
        }

        res.status(200).json({ status: 200, message: 'Financial term image file updated successfully', data: updatedTerm });
    } catch (error) {
        console.error('Error updating financial term image file:', error);
        res.status(500).json({ status: 500, error: error.message });
    }
};

