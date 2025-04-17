const axios = require('axios');
const TournamentMatch = require('../models/tournamentModel');

const fetchAndSaveTournamentMatchData = async (tournamentId) => {
  try {
    // Fetch tournament match data from Riot API
    const response = await axios.get(`https://api.riotgames.com/tournament/v4/matches/${tournamentId}`, {
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY // Use your Riot API key
      }
    });

    // Extract Riot data
    const matchData = response.data;

    // Create the tournament match object that matches your database schema
    const tournamentMatch = new TournamentMatch({
      matchId: matchData.id,
      tournamentId: matchData.tournamentId,
      teamOne: {
        teamId: matchData.teamOne.teamId,
        teamName: matchData.teamOne.teamName,
        teamScore: matchData.teamOne.score
      },
      teamTwo: {
        teamId: matchData.teamTwo.teamId,
        teamName: matchData.teamTwo.teamName,
        teamScore: matchData.teamTwo.score
      },
      matchDuration: matchData.duration,
      matchDate: matchData.date,
      matchWinner: matchData.winner, // Can be 'teamOne' or 'teamTwo'
      stats: {
        avgKDA: 0, // You can populate these with actual stats data if available
        avgGoldPerMinute: 0,
        avgCSPerMinute: 0
      }
    });

    // Save the match data to the database
    await tournamentMatch.save();
    return tournamentMatch;
  } catch (error) {
    console.error('Error fetching or saving tournament data:', error);
    throw new Error('Error fetching or saving tournament data');
  }
};

module.exports = { fetchAndSaveTournamentMatchData };
