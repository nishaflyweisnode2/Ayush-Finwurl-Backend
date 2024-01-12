const express = require("express");
const router = express.Router();
const { dedupe, registerAPI, sendApplicationDetails, webviewAPI } = require("./../controllers/banks/prefr");
const checkValidation = require("../middlewares/check_validation");
// const { checkValidation } = require("./../middlewares/check_validation");

router.route("/dedupe-service").post(checkValidation, dedupe);
router.route("/register-api").post(registerAPI);
router.route("/send-app-details").post(sendApplicationDetails);
router.route("/webview-api").post(webviewAPI);

module.exports = router;
