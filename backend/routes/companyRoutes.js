const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');

// Get all companies with their employees
router.get('/', auth, async (req, res) => {
  try {
    const companies = await Company.find();
    
    // Fetch employees for each company
    const companiesWithEmployees = await Promise.all(
      companies.map(async (company) => {
        const employees = await Employee.find({ companyId: company._id }).select('name position');
        return {
          ...company.toObject(),
          employees
        };
      })
    );

    res.json(companiesWithEmployees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

module.exports = router;
