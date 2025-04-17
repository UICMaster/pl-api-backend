const express = require('express');
const axios = require('axios');
const Tournament = require('../models/Tournament');

// Create a router for tournament-related API calls
const router = express.Router();

// Fetch data from Riot API and store in MongoDB
router.get('/fetch', async (req, res) => {
  try {
    const riotApiUrl = 'https://api.riotgames.com/tournament'; // Change this to the actual Riot API endpoint
    const response = await axios.get(riotApiUrl, {
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY
      }
    });

    // Assume response.data contains the tournament match data
    const matchData = response.data;

    // Store the fetched data in MongoDB
    const newTournament = new Tournament({
      tournamentId: matchData.tournamentId,
      matchData: matchData
    });

    await newTournament.save();
    res.json({ message: 'Tournament data saved successfully', data: newTournament });
  } catch (error) {
    console.error('Error fetching or saving tournament data:', error);
    res.status(500).json({ message: 'Error fetching or saving tournament data', error: error.message });
  }
});

module.exports = router;
