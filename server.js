const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(express.json());

// MongoDB connection setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define schema for storing tournament data
const tournamentSchema = new mongoose.Schema({
  tournamentCode: String,
  participants: [String], // This could be more complex based on your needs
  matchData: Object,
}, { timestamps: true });

const Tournament = mongoose.model('Tournament', tournamentSchema);

// Function to fetch tournament data from Riot API
const fetchTournamentData = async (tournamentCode) => {
  try {
    const response = await axios.get(`https://api.riotgames.com/lol/tournament/v4/codes/${tournamentCode}`, {
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tournament data from Riot API:', error.message);
    throw new Error('Error fetching tournament data');
  }
};

// Function to save tournament data to MongoDB
const saveTournamentData = async (data) => {
  try {
    const tournament = new Tournament({
      tournamentCode: data.tournamentCode,
      participants: data.participants,
      matchData: data,
    });

    await tournament.save();
    console.log('Tournament data saved to MongoDB');
  } catch (error) {
    console.error('Error saving tournament data:', error.message);
    throw new Error('Error saving tournament data');
  }
};

// API endpoint to get tournament match data by code
app.get('/api/tournament/:tournamentCode', async (req, res) => {
  const { tournamentCode } = req.params;

  try {
    // Check if tournament data exists in the database
    let tournament = await Tournament.findOne({ tournamentCode });

    if (!tournament) {
      console.log(`Tournament data for code ${tournamentCode} not found in DB. Fetching from Riot API...`);
      
      // Fetch data from Riot API
      const tournamentData = await fetchTournamentData(tournamentCode);

      // Save the fetched data to MongoDB
      await saveTournamentData(tournamentData);

      tournament = await Tournament.findOne({ tournamentCode });
    }

    // Send the tournament data as response
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament data:', error.message);
    res.status(500).json({ message: 'Error fetching tournament data', error: error.message });
  }
});

// Default route to check server status
app.get('/', (req, res) => {
  res.send('Backend API is working!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

