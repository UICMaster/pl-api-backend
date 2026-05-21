import os
import time
import json
import requests
from datetime import datetime

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
    url = f"{BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids?type=tourney&start=0&count=20"
    return safe_request(url) or []

def get_match_date(match_id):
    """Fetches the match payload to extract the creation date."""
    url = f"{BASE_URL}/lol/match/v5/matches/{match_id}"
    data = safe_request(url)
    
    if data and "info" in data and "gameCreation" in data["info"]:
        # Riot provides gameCreation in milliseconds
        timestamp_ms = data["info"]["gameCreation"]
        timestamp_s = timestamp_ms / 1000.0
        # Convert to YYYY-MM-DD HH:MM:SS
        return datetime.utcfromtimestamp(timestamp_s).strftime('%Y-%m-%d %H:%M:%S')
    return "Unknown Date"

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
                
        # 2. Setup existing games tracking to avoid redundant API calls for dates
        existing_games = team.get("discovered_games", [])
        
        # Handle migration if you already have old string IDs in the JSON
        migrated_games = []
        for g in existing_games:
            if isinstance(g, str):
                migrated_games.append({"id": g, "date": "Unknown Date (Migrated)"})
            else:
                migrated_games.append(g)
                
        existing_ids = {g["id"] for g in migrated_games}
        
        # 3. Intersect and fetch dates ONLY for new games
        new_games_count = 0
        for match_id, count in match_tally.items():
            # If 4+ players share the match AND it's not already in our database
            if count >= 4 and match_id not in existing_ids:
                print(f"New team game found: {match_id}. Fetching date...")
                match_date = get_match_date(match_id)
                migrated_games.append({
                    "id": match_id,
                    "date": match_date
                })
                existing_ids.add(match_id)
                new_games_count += 1
                
        # Sort games by ID (which generally sorts by time since newer IDs are larger)
        team["discovered_games"] = sorted(migrated_games, key=lambda x: x["id"], reverse=True)
        
        print(f"Added {new_games_count} new games for {team['team_name']}.")

    # 4. Save results
    with open(DB_FILE, "w") as f:
        json.dump(database, f, indent=2)

if __name__ == "__main__":
    if not API_KEY:
        print("CRITICAL ERROR: RIOT_API_KEY environment variable not set.")
        exit(1)
    process_teams()
