const express = require("express");
const router = express.Router();
const { send_all_agents, agent_loans } = require("../controllers/admin/agents");
const { dashboard } = require("./../controllers/partner/user");
const {
  send_otp_to_customer,
  verify_customer_otp,
} = require("./../controllers/banks/customer_otp");

router.route("/dashboard").get(dashboard);
router.route("/all_agents").get(send_all_agents);
router.route("/send_otp_to_customer").post(send_otp_to_customer);
router.route("/verify_customer_otp").post(verify_customer_otp);
router.route("/agent_loans/:id").get(agent_loans);

module.exports = router;
