const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const requestRoutes = require('./routes/requestRoutes');
const seedRoutes = require('./routes/seedRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/seed', seedRoutes);

const path = require('path');

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Any other route should serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});