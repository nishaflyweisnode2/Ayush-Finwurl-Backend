const axios = require("axios");
const User = require("../../models/User");
const apiKey = process.env.PREFR_API_KEY;
const jsonPincode = require("./../../constants/pincode_prefr.json");
const dedupe = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.creditvidya.com/marketplace/mw/loans/v2/dedupe-service",
      req.body,
      {
        headers: {
          apiKey: apiKey,
          "Content-Type": "application/json", // Adjust the content type as required
        },
      }
    );
    console.log("response", response.data)
    if (response.data.status === "success") {
      res.status(200).json(response.data.status);
    } else {
      res.status(400).json({ errors: response.data.errors[0] });
    }
  } catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const registerAPI = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.creditvidya.com/marketplace/mw/loans/v4/register-start/pl",
      req.body,
      {
        headers: {
          apiKey: apiKey,
          "Content-Type": "application/json", // Adjust the content type as required
        },
      }
    );

    if (response.data.status === "success") {
      res.status(200).json(response.data.data);
    } else {
      res.status(400).json({ errors: response.data.errors[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const sendApplicationDetails = async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.creditvidya.com/marketplace/mw/loans/v2/application-details",
      req.body,
      {
        headers: {
          apiKey: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.status === "success") {
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ errors: response.data.errors[0] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const webviewAPI = async (req, res) => {
  try {
    console.log(req.body.loanId);
    const user = await User.findOne({ _id: req.body.loggedInUserId });
    const response = await axios.post(
      "https://api.creditvidya.com/marketplace/mw/loans/get-webview",
      { loanId: req.body.loanId },
      {
        headers: {
          apiKey: apiKey,
          "Content-Type": "application/json", // Adjust the content type as required
        },
      }
    );
    console.log(response);
    if (response.data.status === "success") {
      const data = { ...req.body.formData, bank_name: "prefr" };
      user.loans.push(data);
      await user.save();
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ errors: response.data.errors[0] });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  dedupe,
  registerAPI,
  sendApplicationDetails,
  webviewAPI,
};
