import os
import time
import json
import requests

# Configuration
API_KEY = os.environ.get("RIOT_API_KEY")
HEADERS = {"X-Riot-Token": API_KEY}
BASE_URL = "https://europe.api.riotgames.com"
DB_FILE = "teams.json"

def safe_request(url):
    """Makes a request and enforces strict Personal Key rate limiting."""
    response = requests.get(url, headers=HEADERS)
    time.sleep(1.2) # Guarantees we stay well under 100 req / 2 mins
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"API Error {response.status_code} for URL: {url}")
        return None

def get_puuid(game_name, tag_line):
    url = f"{BASE_URL}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    data = safe_request(url)
    return data.get("puuid") if data else None

def get_tourney_matches(puuid):
    # type=tourney strictly filters for custom/tournament draft games
    url = f"{BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids?type=tourney&start=0&count=20"
    return safe_request(url) or []

def process_teams():
    with open(DB_FILE, "r") as f:
        database = json.load(f)

    for team in database:
        print(f"Scouting team: {team['team_name']}")
        match_tally = {}
        
        # 1. Gather Matches for all players
        for player in team["players"]:
            puuid = get_puuid(player["gameName"], player["tagLine"])
            if not puuid:
                continue
            
            matches = get_tourney_matches(puuid)
            for match_id in matches:
                match_tally[match_id] = match_tally.get(match_id, 0) + 1
                
        # 2. Intersect: Only keep games where at least 4 out of 5 players were present
        # (Allows for 1 substitute player without breaking the scout logic)
        team_games = [m_id for m_id, count in match_tally.items() if count >= 4]
        
        # 3. Update Database (deduplicating existing games)
        existing_games = set(team.get("discovered_games", []))
        updated_games = list(existing_games.union(set(team_games)))
        team["discovered_games"] = sorted(updated_games, reverse=True)
        
        print(f"Found {len(team_games)} team games.")

    # 4. Save results
    with open(DB_FILE, "w") as f:
        json.dump(database, f, indent=2)

if __name__ == "__main__":
    if not API_KEY:
        print("CRITICAL ERROR: RIOT_API_KEY environment variable not set.")
        exit(1)
    process_teams()
