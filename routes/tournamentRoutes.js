const express = require('express');
const router = express.Router();
const { fetchAndSaveTournamentMatchData } = require('../controllers/tournamentController');

// Route to fetch and store tournament match data
router.get('/fetch-match/:tournamentId', async (req, res) => {
  const tournamentId = req.params.tournamentId;

  try {
    const match = await fetchAndSaveTournamentMatchData(tournamentId);
    res.json({ message: 'Tournament match data saved successfully', match });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching or saving data' });
  }
});

module.exports = router;
