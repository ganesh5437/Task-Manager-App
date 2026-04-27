const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Company = require('../models/Company');
const auth = require('../middleware/auth');

// Send a request to a company (User)
router.post('/', auth, async (req, res) => {
  try {
    const { companyId } = req.body;
    
    if (req.user.role !== 'user') return res.status(403).json({ message: "Only users can send requests" });

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Check for existing pending request
    const existing = await Request.findOne({ userId: req.user.id, companyId, status: 'Pending' });
    if (existing) return res.status(400).json({ message: "You already have a pending request for this company" });

    const request = new Request({ userId: req.user.id, companyId });
    await request.save();

    res.status(201).json({ message: "Request sent successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get my requests (User)
router.get('/my-requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ message: "Access denied" });
    
    const requests = await Request.find({ userId: req.user.id })
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get company requests (Admin)
router.get('/company-requests', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company_admin') return res.status(403).json({ message: "Access denied" });
    
    // Find companies this admin manages (for simplicity, we assume an admin can see all requests if there's only one admin, or we filter by adminId if we set that up)
    // For this project, let's let the company admin see all pending requests for all companies they manage
    const myCompanies = await Company.find({ adminId: req.user.id });
    const companyIds = myCompanies.map(c => c._id);

    const requests = await Request.find({ companyId: { $in: companyIds } })
      .populate('userId', 'name email')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Accept/Reject request (Admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company_admin') return res.status(403).json({ message: "Access denied" });
    
    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Verify admin owns the company
    const company = await Company.findOne({ _id: request.companyId, adminId: req.user.id });
    if (!company) return res.status(403).json({ message: "You don't manage this company" });

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status.toLowerCase()}`, request });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
