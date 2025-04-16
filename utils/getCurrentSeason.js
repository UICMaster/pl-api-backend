const fs = require('fs');
const path = require('path');

function getCurrentSeason() {
  const filePath = path.join(__dirname, '../seasonData.json');
  const rawData = fs.readFileSync(filePath);
  const data = JSON.parse(rawData);

  return data.seasons.find(season => season.current);
}

module.exports = getCurrentSeason;
