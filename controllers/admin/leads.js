const Leads = require("../../models/Leads");
const User = require("../../models/User");
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');



const addLeads = async (req, res) => {
  try {
    const {
      loggedInUserId,
      full_name,
      lender_bank,
      amount,
      status,
      loanType,
      date
    } = req.body;

    let leadsLoanType = loanType;

    if (loanType === 'all') {
      const loansCategory = await Category.findOne({ name: "Loans" });

      if (!loansCategory) {
        return res.status(404).json({ message: "Loans category not found" });
      }

      const allSubCategories = await SubCategory.find({ category: loansCategory._id });

      const allSubCategoryIds = allSubCategories.map(subCategory => subCategory._id);

      leadsLoanType = allSubCategoryIds;
    }

    const leads = await Leads.create({
      partner: loggedInUserId,
      full_name: full_name,
      lender_bank: lender_bank,
      amount: amount,
      status: status,
      loanType: leadsLoanType,
      date: date || new Date()
    });

    res.status(200).json({ message: "Lead punched successfully!", data: leads });

  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong!");
  }
};

const getLeads = async (req, res) => {
  try {
    const allLeads = await Leads.find({}).populate('partner loanType');
    res.status(200).json(allLeads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateLead = async (req, res) => {
  const leadId = req.params.id;
  const updateFields = req.body;

  try {
    const lead = await Leads.findById(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    Object.assign(lead, updateFields);

    const updatedLead = await lead.save();

    res.status(200).json({ message: "Lead updated successfully", data: updatedLead });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

const deleteLead = async (req, res) => {
  const leadId = req.params.id;

  try {
    const lead = await Leads.findByIdAndDelete(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
};

module.exports = {
  addLeads,
  getLeads,
  updateLead,
  deleteLead
};
