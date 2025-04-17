const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tournamentRoutes = require('./routes/tournamentRoutes');

dotenv.config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(express.json());  // Parse incoming JSON requests

// API Routes
app.use('/api/tournaments', tournamentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
