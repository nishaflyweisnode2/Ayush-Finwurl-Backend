const express = require("express");
const router = express.Router();

const auth = require("../../controllers/appController/userController")

const authJwt = require("../../middlewares/auth");

const { profileImage } = require('../../middlewares/imageUpload');


router.post("/signup", auth.signup_partner);
router.post("/login", auth.login_partner);
router.post("/verifyOtp", auth.verify_otp);
router.post('/users/details', [authJwt.verifyToken], auth.createUserDetails);
router.put("/user/upload-id-picture", [authJwt.verifyToken], profileImage.single('image'), auth.uploadIdPicture);
router.put("/user/updateLocation", [authJwt.verifyToken], auth.updateLocation);
router.put("/user/edit-profile", [authJwt.verifyToken], auth.editProfile);
router.get("/user/profile", [authJwt.verifyToken], auth.getUserProfile);
router.get("/user/profile/:userId", [authJwt.verifyToken], auth.getUserProfileById);
router.post('/user/calculateLoan', [authJwt.verifyToken], auth.calculateLoan);



module.exports = router;
