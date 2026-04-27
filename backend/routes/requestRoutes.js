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

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Check for existing active request
    const existing = await Request.findOne({ 
      userId: req.user.id, 
      companyId, 
      status: { $in: ['Pending', 'Offered', 'In_Progress', 'Completed'] } 
    });
    
    if (existing) return res.status(400).json({ message: "You already have an active request for this company" });

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

// Admin: Reject Request
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company_admin') return res.status(403).json({ message: "Access denied" });
    
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const company = await Company.findOne({ _id: request.companyId, adminId: req.user.id });
    if (!company) return res.status(403).json({ message: "You don't manage this company" });

    request.status = 'Rejected';
    await request.save();

    res.json({ message: "Request rejected successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Admin: Offer Project
router.patch('/:id/offer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'company_admin') return res.status(403).json({ message: "Access denied" });
    
    const { projectTitle, projectDescription, projectDeadline } = req.body;
    
    if (!projectTitle || !projectDescription || !projectDeadline) {
      return res.status(400).json({ message: "Project details and deadline are required" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const company = await Company.findOne({ _id: request.companyId, adminId: req.user.id });
    if (!company) return res.status(403).json({ message: "You don't manage this company" });

    request.status = 'Offered';
    request.projectTitle = projectTitle;
    request.projectDescription = projectDescription;
    request.projectDeadline = new Date(projectDeadline);
    await request.save();

    res.json({ message: "Project offered to candidate", request });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Candidate: Update Project Status (Accept, Decline, Complete)
router.patch('/:id/candidate-action', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ message: "Access denied" });
    
    const { action } = req.body; // 'accept', 'decline', 'complete'
    
    const request = await Request.findOne({ _id: req.params.id, userId: req.user.id });
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (action === 'accept' && request.status === 'Offered') {
      request.status = 'In_Progress';
    } else if (action === 'decline' && request.status === 'Offered') {
      request.status = 'Candidate_Rejected';
    } else if (action === 'complete' && request.status === 'In_Progress') {
      request.status = 'Completed';
    } else {
      return res.status(400).json({ message: "Invalid action for current status" });
    }

    await request.save();

    res.json({ message: `Project ${action}ed successfully`, request });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
