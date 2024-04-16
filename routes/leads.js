const express = require("express");
const router = express.Router();
const { addLeads, getLeads, updateLead, deleteLead } = require("./../controllers/admin/leads");

router.route("/").post(addLeads);
router.route("/getLeads").get(getLeads);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
