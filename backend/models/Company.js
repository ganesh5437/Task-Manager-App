const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  logo: { type: String, default: '🏢' }, // Using emoji as placeholder logo
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The company admin user
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
