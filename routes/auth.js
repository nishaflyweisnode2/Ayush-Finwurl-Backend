const express = require("express");
const router = express.Router();
const { login_cofounder, login_cofounder_verify_otp } = require("./../controllers/auth/auth_admin")
const { signup_partner, login_partner, verify_otp } = require("./../controllers/auth/auth_partner")
const { signup_user } = require("./../controllers/auth/auth_user")
const { reset_password_send_otp, reset_pass_verify_otp, reset_password } = require("./../controllers/auth/reset_password")

const auth = require("./../controllers/auth/auth_user")

const authJwt = require("./../middlewares/auth");

const { profileImage } = require('./../middlewares/imageUpload');


router.route("/signup").post(signup_partner);
router.route("/login").post(login_partner);
router.route("/verifyOtp").post(verify_otp);
router.route("/signup/user").post(signup_user);
router.route("/reset_pass_send_otp").post(reset_password_send_otp);
router.route("/reset_pass_verify_otp").post(reset_pass_verify_otp);
router.route("/reset_password").post(reset_password);
router.route("/login_cofounder").post(login_cofounder);
router.route("/login_cofounder_verify_otp").post(login_cofounder_verify_otp);
//
router.post('/users/details', [authJwt.verifyToken], auth.createUserDetails);
router.put("/user/upload-id-picture", [authJwt.verifyToken], profileImage.single('image'), auth.uploadIdPicture);
router.put("/user/updateLocation", [authJwt.verifyToken], auth.updateLocation);
router.put("/user/edit-profile", [authJwt.verifyToken], auth.editProfile);
router.get("/user/profile", [authJwt.verifyToken], auth.getUserProfile);
router.get("/user/profile/:userId", [authJwt.verifyToken], auth.getUserProfileById);
router.post('/user/calculateLoan', /*[authJwt.verifyToken],*/ auth.calculateLoan);
router.get('/user/loan-details', /*[authJwt.verifyToken],*/ auth.getAllLoanDetails);
router.get('/user/loan-details/:id', /*[authJwt.verifyToken],*/ auth.getLoanDetailById);
router.get('/user/categories', /*[authJwt.verifyToken],*/ auth.getAllCategories);
router.get("/user/SubCategory/:categoryId", /*[authJwt.verifyToken],*/ auth.getSubCategories);
router.get("/user/getAllSubCategories", /*[authJwt.verifyToken],*/ auth.getAllSubCategories);
router.get('/user/categories/:categoryId', [authJwt.verifyToken], auth.getCategoryById);
router.post('/user/eligibility-checks', [authJwt.verifyToken], auth.createEligibilityCheck);
router.get('/user/eligibility-checks', [authJwt.verifyToken], auth.getAllEligibilityChecks);
router.get('/user/eligibility-checks/:id', [authJwt.verifyToken], auth.getEligibilityCheckById);
router.put('/user/eligibility-checks/:id', [authJwt.verifyToken], auth.updateEligibilityCheckById);
router.delete('/user/eligibility-checks/:id', [authJwt.verifyToken], auth.deleteEligibilityCheckById);
router.get('/user/financial-terms', [authJwt.verifyToken], auth.getAllFinancialTerms);
router.get('/user/financial-terms/:termId', [authJwt.verifyToken], auth.getFinancialTermById);
router.get('/user/banners', /*[authJwt.verifyToken],*/ auth.getAllBanners);
router.get('/user/banners/:id', /*[authJwt.verifyToken],*/ auth.getBannerById);
router.post('/user/rating-reviews', [authJwt.verifyToken], auth.createRatingReview);
router.get('/user/rating-reviews', [authJwt.verifyToken], auth.getAllRatingReviews);
router.get('/user/rating-reviews/:id', [authJwt.verifyToken], auth.getRatingReviewById);
router.put('/user/rating-reviews/:id', [authJwt.verifyToken], auth.updateRatingReviewById);
router.delete('/user/rating-reviews/:id', [authJwt.verifyToken], auth.deleteRatingReviewById);
router.get('/user/contact-us', [authJwt.verifyToken], auth.getAllContactUsEntries);
router.get('/user/contact-us/:id', [authJwt.verifyToken], auth.getContactUsById);
router.get('/user/referral-link', [authJwt.verifyToken], auth.getReferralLink);
router.get('/user/disclamer', [authJwt.verifyToken], auth.getAllDisclamer);
router.get('/user/disclamer/:id', [authJwt.verifyToken], auth.getDisclamerById);
router.get('/user/notifications/user/get', [authJwt.verifyToken], auth.getNotificationsForUser);
router.put('/user/notifications/:notificationId', [authJwt.verifyToken], auth.markNotificationAsRead);
router.get('/user/benefits', /*[authJwt.isAdmin],*/ auth.getAllBenefits);
router.get('/user/benefits/:benefitsId', /*[authJwt.isAdmin],*/ auth.getBenefitsById);
router.get('/user/partner', /*[authJwt.verifyToken],*/ auth.getAllPartner);
router.get('/user/partner/:partnerId', /*[authJwt.verifyToken],*/ auth.getPartnerById);
router.get('/user/terms-and-conditions', [authJwt.verifyToken], auth.getAllTermAndCondition);
router.get('/user/terms-and-conditions/:id', [authJwt.verifyToken], auth.getTermAndConditionById);
router.get('/user/faqs', [authJwt.verifyToken], auth.getAllFAQs);
router.get('/user/faqs/:id', [authJwt.verifyToken], auth.getFAQById);


module.exports = router;
