const mongoose = require('mongoose');

const tournamentMatchSchema = new mongoose.Schema({
  matchId: String,
  tournamentId: String,
  teamOne: {
    teamId: String,
    teamName: String,
    teamScore: Number
  },
  teamTwo: {
    teamId: String,
    teamName: String,
    teamScore: Number
  },
  matchDuration: Number, // In seconds
  matchDate: Date, // Timestamp of when the match was played
  matchWinner: String, // "teamOne" or "teamTwo"
  stats: {
    avgKDA: Number,
    avgGoldPerMinute: Number,
    avgCSPerMinute: Number
  }
});

const TournamentMatch = mongoose.model('TournamentMatch', tournamentMatchSchema);

module.exports = TournamentMatch;
