const express = require("express");
const router = express.Router();

const auth = require("../../controllers/appController/adminController")

const authJwt = require("../../middlewares/auth");

const { profileImage, loanDetails, categoryImage } = require('../../middlewares/imageUpload');


// api/user/

router.post('/api/admin/register', auth.register);
router.post('/api/admin/login', auth.login)
router.get('/api/admin/users', [authJwt.isAdmin], auth.getAllUsers);
router.get('/api/admin/users/:userId', [authJwt.isAdmin], auth.getUserById)
router.put('/api/admin/update/:userId', [authJwt.isAdmin], auth.updateProfile);
router.put('/api/admin/upload-profile-picture/:userId', [authJwt.isAdmin], profileImage.single('image'), auth.uploadProfilePicture);
router.delete('/api/admin/users/:userId', [authJwt.isAdmin], auth.deleteUser);
router.post('/api/admin/notifications', [authJwt.isAdmin], auth.createNotification);
router.get('/api/admin/notifications/user/:userId', [authJwt.isAdmin], auth.getNotificationsForUser);
router.get('/api/admin/notifications', [authJwt.isAdmin], auth.getAllNotifications);
router.delete('/api/admin/notifications/:id', [authJwt.isAdmin], auth.deleteNotification);
router.post('/api/admin/loan-details', [authJwt.isAdmin], loanDetails.single('image'), auth.createLoanDetail);
router.get('/api/admin/loan-details', [authJwt.isAdmin], auth.getAllLoanDetails);
router.get('/api/admin/loan-details/:id', [authJwt.isAdmin], auth.getLoanDetailById);
router.put('/api/admin/loan-details/:id', [authJwt.isAdmin], loanDetails.single('image'), auth.updateLoanDetailById);
router.delete('/api/admin/loan-details/:id', [authJwt.isAdmin], auth.deleteLoanDetailById);
router.post('/api/admin/categories', [authJwt.isAdmin], categoryImage.single('image'), auth.createCategory);
router.get('/api/admin/categories', [authJwt.isAdmin], auth.getAllCategories);
router.get('/api/admin/forAdminCategories', /*[authJwt.isAdmin],*/ auth.getAllCategoriesForAdmin);
router.get('/api/admin/categories/:categoryId', [authJwt.isAdmin], auth.getCategoryById);
router.put('/api/admin/categories/:categoryId', [authJwt.isAdmin], categoryImage.single('image'), auth.updateCategory);
router.delete('/api/admin/categories/:categoryId', [authJwt.isAdmin], auth.deleteCategory);


module.exports = router;
