const express = require("express");
const router = express.Router();
const { prefrWebhook } = require("./../controllers/webhook/prefr_webhook");
const { stashfinWebhook } = require("./../controllers/webhook/stashfin_webhook");

router.route("/prefr-webhook").post(prefrWebhook);
router.route("/stashfin-check-status").post(stashfinWebhook);

module.exports = router;
