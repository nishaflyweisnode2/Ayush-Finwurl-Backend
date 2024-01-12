const StashfinWebhook = require("../../models/StashfinLoans");
const axios = require("axios");
const User = require("../../models/User");

const stashfinWebhook = async (req, res) => {
    try {
      const { application_id, client_token } = req.body;
      console.log(application_id);
  
      setTimeout(async () => {
        try {
          const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `https://api.stashfin.com/v3/check-status?application_id=${application_id}`,
            headers: {
              "Content-Type": "application/json",
              "client-token": client_token,
            },
          };
  
          const resp = await axios(config);
          if (resp.status != 200) {
            res.status(401).json({ message: error.response.data });
          }
          const { status, results } = resp.data;
          const applicationId = results.application_id;
  
          await StashfinWebhook.findOneAndUpdate(
            { "results.application_id": applicationId },
            {
              $set: {
                status: status,
                results: results,
              },
            },
            { upsert: true, new: true }
          );
  
          await User.updateOne(
            { "loans.results.application_id": applicationId },
            {
              $set: {
                "loans.$.status": status,
                "loans.$.results": results,
              },
            }
          );
  
          res.status(200).json({ message: "Loan status updated successfully!" });
        } catch (error) {
          console.error(error.response.data);
          res.status(500).json({ error: error.response.data });
        }
      }, 300000);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  
module.exports = {
    stashfinWebhook,
};