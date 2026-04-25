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
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
  res.send("Server Running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});