const express = require("express");
const router = express.Router();
const { addLeads, getLeads } = require("./../controllers/admin/leads");

router.route("/").patch(addLeads);
router.route("/getLeads").get(getLeads);

module.exports = router;
