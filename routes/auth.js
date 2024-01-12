const express = require("express");
const router = express.Router();
const { login_cofounder, login_cofounder_verify_otp} = require("./../controllers/auth/auth_admin")
const { signup_partner, login_partner, verify_otp} = require("./../controllers/auth/auth_partner")
const { signup_user } = require("./../controllers/auth/auth_user")
const { reset_password_send_otp, reset_pass_verify_otp, reset_password } = require("./../controllers/auth/reset_password")

router.route("/signup").post(signup_partner);
router.route("/login").post(login_partner);
router.route("/verifyOtp").post(verify_otp);
router.route("/signup/user").post(signup_user);
router.route("/reset_pass_send_otp").post(reset_password_send_otp);
router.route("/reset_pass_verify_otp").post(reset_pass_verify_otp);
router.route("/reset_password").post(reset_password);
router.route("/login_cofounder").post(login_cofounder);
router.route("/login_cofounder_verify_otp").post(login_cofounder_verify_otp);

module.exports = router;
