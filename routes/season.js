const express = require('express');
const router = express.Router();
const getCurrentSeason = require('../utils/getCurrentSeason');

router.get('/season/current', (req, res) => {
  const season = getCurrentSeason();
  if (!season) {
    return res.status(404).json({ message: 'No current season found.' });
  }
  res.json(season);
});

module.exports = router;
