const express = require("express");
const router = express.Router();

const auth = require("../../controllers/appController/adminController")

const authJwt = require("../../middlewares/auth");

const { profileImage, loanDetails, categoryImage, bannerImage, subCategory, creditImage, productImage, benefitsImage } = require('../../middlewares/imageUpload');


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
router.post('/api/admin/partner', [authJwt.isAdmin], productImage.single('image'), auth.createPartner);
router.get('/api/admin/partner', [authJwt.isAdmin], auth.getAllPartner);
router.get('/api/admin/partner/:partnerId', [authJwt.isAdmin], auth.getPartnerById);
router.put('/api/admin/partner/:partnerId', [authJwt.isAdmin], productImage.single('image'), auth.updatePartner);
router.delete('/api/admin/partner/:partnerId', [authJwt.isAdmin], auth.deletePartner);
router.post('/api/admin/benefits', [authJwt.isAdmin], benefitsImage.single('image'), auth.createBenefits);
router.get('/api/admin/benefits', [authJwt.isAdmin], auth.getAllBenefits);
router.get('/api/admin/benefits/:benefitsId', [authJwt.isAdmin], auth.getBenefitsById);
router.put('/api/admin/benefits/:benefitsId', [authJwt.isAdmin], benefitsImage.single('image'), auth.updateBenefits);
router.delete('/api/admin/benefits/:benefitsId', [authJwt.isAdmin], auth.deleteBenefits);
router.post('/api/admin/faqs/create', [authJwt.isAdmin], auth.createFAQ);
router.get('/api/admin/faqs', [authJwt.isAdmin], auth.getAllFAQs);
router.get('/api/admin/faqs/:id', [authJwt.isAdmin], auth.getFAQById);
router.put('/api/admin/faqs/:id', [authJwt.isAdmin], auth.updateFAQById);
router.delete('/api/admin/faqs/:id', [authJwt.isAdmin], auth.deleteFAQById);
router.post('/api/admin/terms-and-conditions', [authJwt.isAdmin], auth.createTermAndCondition);
router.get('/api/admin/terms-and-conditions', [authJwt.isAdmin], auth.getAllTermAndCondition);
router.get('/api/admin/terms-and-conditions/:id', [authJwt.isAdmin], auth.getTermAndConditionById);
router.put('/api/admin/terms-and-conditions/:id', [authJwt.isAdmin], auth.updateTermAndConditionById);
router.delete('/api/admin/terms-and-conditions/:id', [authJwt.isAdmin], auth.deleteTermAndConditionById);
router.post('/api/admin/rating-reviews', [authJwt.isAdmin], auth.createRatingReview);
router.get('/api/admin/rating-reviews', [authJwt.isAdmin], auth.getAllRatingReviews);
router.get('/api/admin/rating-reviews/:id', [authJwt.isAdmin], auth.getRatingReviewById);
router.put('/api/admin/rating-reviews/:id', [authJwt.isAdmin], auth.updateRatingReviewById);
router.delete('/api/admin/rating-reviews/:id', [authJwt.isAdmin], auth.deleteRatingReviewById);



module.exports = router;
