const axios = require("axios");
const User = require("../../models/User");

const loginClient = async (req, res) => {
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.stashfin.com/v3/login-client",
      data: req.body,
    };

    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        res.status(200).json(response.data);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: "Token has been revoked" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
const dedupe = async (req, res) => {
  try {
    const { email, phone, token } = req.body;
    console.log("---",req.body);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.stashfin.com/v3/check-duplicate",
      headers: {
        "client-token": token,
      },
      data: {
        email: email,
        phone: phone,
      },
    };
    console.log("***",config);

    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        if (response.data.results)
          res.status(200).json({ message: "Not Eligible" });
        else res.status(200).json({ message: "Eligible" });
      })
      .catch((error) => {
        console.log(error);
        res
          .status(400)
          .json({ message: "Please check your details and try again" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const initiateApplication = async (req, res) => {
  console.log("inside");
  try {
    const {
      loggedInUserId,
      first_name,
      middle_name,
      last_name,
      pan_number,
      phone,
      pincode,
      income,
      gender,
      dob,
      email,
      employment_type,
      mode_of_income,
      token,
    } = req.body;
    const response = await axios.post(
      "https://api.stashfin.com/v3/initiate-application",
      {
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        phone: phone,
        pincode: pincode,
        income: income,
        gender: gender,
        pan_number: pan_number,
        dob: dob,
        email: email,
        employment_type: employment_type,
        mode_of_income: mode_of_income,
      },
      {
        headers: {
          "client-token": token,
        },
      }
    );
    console.log("response.status:", response.data);
    if (response.data.status) {
      const user = await User.findOne({ _id: loggedInUserId });
      user.loans.push({
        bank_name: "stashfin",
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        phone: phone,
        pincode: pincode,
        income: income,
        gender: gender,
        pan_number: pan_number,
        dob: dob,
        email: email,
        employment_type: employment_type,
        mode_of_income: mode_of_income,
        status: false,
        results: {
          application_id: response.data.results.application_id,
        },
      });
      await user.save();
      res.status(200).json(response.data);
    }
  } catch (error) {
    console.log(error.response.status);
    console.log(error.response.data);
    if (
      error.response.status === 400 &&
      error.response.data.errors === "customer already exists"
    ) {
      res.status(409).json({ message: "User already exists" });
    } else {
      res.status(401).json({ message: "Invalid details provided" });
    }
  }
};

module.exports = {
  dedupe,
  initiateApplication,
  loginClient,
};
