const express = require("express");
const router = express.Router();

const auth = require("../../controllers/appController/adminController")

const authJwt = require("../../middlewares/auth");

const { profileImage, loanDetails, categoryImage, bannerImage, subCategory, creditImage } = require('../../middlewares/imageUpload');


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
router.get('/api/admin/categories/:categoryId', [authJwt.isAdmin], auth.getCategoryById);
router.put('/api/admin/categories/:categoryId', [authJwt.isAdmin], categoryImage.single('image'), auth.updateCategory);
router.delete('/api/admin/categories/:categoryId', [authJwt.isAdmin], auth.deleteCategory);
router.post('/api/admin/banners', [authJwt.isAdmin], bannerImage.single('image'), auth.createBanner);
router.get('/api/admin/banners', [authJwt.isAdmin], auth.getAllBanners);
router.get('/api/admin/banners/:id', [authJwt.isAdmin], auth.getBannerById);
router.put('/api/admin/banners/:id', [authJwt.isAdmin], bannerImage.single('image'), auth.updateBannerById);
router.delete('/api/admin/banners/:id', [authJwt.isAdmin], auth.deleteBannerById);
router.post("/SubCategory/createCategory", [authJwt.isAdmin], subCategory.single('image'), auth.createSubCategory);
router.get("/SubCategory/:categoryId", [authJwt.isAdmin], auth.getSubCategories);
router.get("/getAllSubCategories", [authJwt.isAdmin], auth.getAllSubCategories);
router.put("/SubCategory/update/:id", [authJwt.isAdmin], subCategory.single('image'), auth.updateSubCategory);
router.delete("/SubCategory/delete/:id", [authJwt.isAdmin], auth.removeSubCategory);
router.post('/financial-terms', [authJwt.isAdmin], creditImage.array('image'), auth.createFinancialTerm);
router.get('/financial-terms', [authJwt.isAdmin], auth.getAllFinancialTerms);
router.get('/financial-terms/:termId', [authJwt.isAdmin], auth.getFinancialTermById);
router.put('/financial-terms/:termId/images', [authJwt.isAdmin], creditImage.array('image'), auth.updateFinancialTerm);
router.delete('/financial-terms/:termId', [authJwt.isAdmin], auth.deleteFinancialTerm);
router.put('/financial-terms/:termId/images/:imageId', creditImage.single('image'), [authJwt.isAdmin], auth.updateFinancialTermImageFileById);





module.exports = router;
