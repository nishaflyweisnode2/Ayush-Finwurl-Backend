const express = require("express");
const router = express.Router();
const { dedupe, initiateApplication, loginClient } = require("./../controllers/banks/stashfin");

router.route("/dedupe").post(dedupe);
router.route("/initiate-application").post(initiateApplication);
router.route("/login-client").post(loginClient);

module.exports = router;
