const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/run', async (req, res) => {
  try {
    // 1. Clear existing data
    await Company.deleteMany({});
    await Employee.deleteMany({});
    
    // We only delete company admins to reset them, not regular users
    await User.deleteMany({ role: 'company_admin' });

    // 2. Create an admin user to manage these companies
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Admin',
      email: 'admin@system.com',
      password: adminPassword,
      role: 'company_admin'
    });
    await admin.save();

    // 3. Create Companies
    const companiesData = [
      { name: 'Google', description: 'Organizing the world\'s information.', industry: 'Technology', logo: '🌐', adminId: admin._id },
      { name: 'Microsoft', description: 'Empowering every person and organization.', industry: 'Technology', logo: '🪟', adminId: admin._id },
      { name: 'TCS', description: 'Tata Consultancy Services.', industry: 'IT Services', logo: '🏢', adminId: admin._id },
      { name: 'Infosys', description: 'Navigate your next.', industry: 'IT Services', logo: '🔷', adminId: admin._id },
      { name: 'Wipro', description: 'Applying thought.', industry: 'IT Services', logo: '🌈', adminId: admin._id }
    ];

    const companies = await Company.insertMany(companiesData);

    // 4. Create Employees
    const employeesData = [];
    
    const googleId = companies.find(c => c.name === 'Google')._id;
    employeesData.push({ name: 'Sundar Pichai', position: 'CEO', companyId: googleId });
    employeesData.push({ name: 'Ruth Porat', position: 'CFO', companyId: googleId });
    
    const msftId = companies.find(c => c.name === 'Microsoft')._id;
    employeesData.push({ name: 'Satya Nadella', position: 'CEO', companyId: msftId });
    employeesData.push({ name: 'Amy Hood', position: 'CFO', companyId: msftId });

    const tcsId = companies.find(c => c.name === 'TCS')._id;
    employeesData.push({ name: 'K. Krithivasan', position: 'CEO', companyId: tcsId });
    employeesData.push({ name: 'N. Ganapathy', position: 'COO', companyId: tcsId });
    
    const infyId = companies.find(c => c.name === 'Infosys')._id;
    employeesData.push({ name: 'Salil Parekh', position: 'CEO', companyId: infyId });
    employeesData.push({ name: 'Nandan Nilekani', position: 'Chairman', companyId: infyId });
    
    const wiproId = companies.find(c => c.name === 'Wipro')._id;
    employeesData.push({ name: 'Srini Pallia', position: 'CEO', companyId: wiproId });
    employeesData.push({ name: 'Rishad Premji', position: 'Chairman', companyId: wiproId });

    await Employee.insertMany(employeesData);

    res.json({ message: "Database seeded successfully with companies and employees. Admin login: admin@system.com / admin123" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Seed failed", error: err.message });
  }
});

module.exports = router;
