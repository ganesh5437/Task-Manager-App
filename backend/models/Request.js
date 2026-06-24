const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

// Prevent duplicate pending requests to the same company
requestSchema.index({ userId: 1, companyId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'Pending' } });

module.exports = mongoose.model("Request", requestSchema);
