const mongoose = require('mongoose');

// Define the schema for tournament data
const tournamentSchema = new mongoose.Schema({
  tournamentId: { type: String, required: true },
  matchData: {
    type: Object, // Assuming the match data is complex and may contain nested objects
    required: true
  },
  dateFetched: { type: Date, default: Date.now }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
