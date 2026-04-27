const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  
  // Status workflow: 
  // 1. Pending (User applied)
  // 2. Rejected (Admin declined)
  // 3. Offered (Admin sent project)
  // 4. Candidate_Rejected (Candidate refused project)
  // 5. In_Progress (Candidate accepted project)
  // 6. Completed (Candidate finished project)
  status: { 
    type: String, 
    enum: ['Pending', 'Rejected', 'Offered', 'Candidate_Rejected', 'In_Progress', 'Completed'], 
    default: 'Pending' 
  },
  
  // Project details assigned by Admin
  projectTitle: { type: String },
  projectDescription: { type: String },
  projectDeadline: { type: Date }
  
}, { timestamps: true });

// Prevent duplicate pending or active requests to the same company
// Only allow a new request if all previous ones are Rejected or Candidate_Rejected
requestSchema.index({ userId: 1, companyId: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    status: { $in: ['Pending', 'Offered', 'In_Progress', 'Completed'] } 
  } 
});

module.exports = mongoose.model("Request", requestSchema);
