const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data'); // Ensure 'data' directory is in the same folder as the script

// Ensure the `data` directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ** Utility function to read JSON files **
function readJSON(filename) {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return null; // File does not exist
    }
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Error reading file '${filename}':`, error);
        return null;
    }
}

// ** Utility function to write JSON files **
function writeJSON(filename, data) {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Successfully saved: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error writing file '${filename}':`, error);
    }
}

// ** Fetch Data Functions **
const fetchMatches = () => readJSON('matches') || [];
const fetchTeams = () => readJSON('teams') || {};
const fetchTeamData = () => readJSON('teamData') || {};
const fetchBrackets = () => readJSON('brackets') || {};
const fetchOfficialStats = () => readJSON('officialStats') || {};
const fetchGamesStarted = () => readJSON('gamesStarted') || false;
const fetchGameIDCounter = () => readJSON('gameIDCounter') || 0;

function fetchFirstClick(firstClickKey) {
    const firstClickData = readJSON('firstClick') || {};
    return firstClickData[firstClickKey] || false;
}

// ** Save Data Functions **
const saveMatches = (matches) => writeJSON('matches', matches);
const saveTeams = (teams) => writeJSON('teams', teams);
const saveTeamData = (teamData) => writeJSON('teamData', teamData);
const saveOfficialStats = (officialStats) => writeJSON('officialStats', officialStats);
const saveBrackets = (brackets) => writeJSON('brackets', brackets);
const saveGameIDCounter = (counter) => writeJSON('gameIDCounter', counter);

function saveFirstClick(firstClickKey, state) {
    let firstClickData = readJSON('firstClick') || {};
    firstClickData[firstClickKey] = state;
    writeJSON('firstClick', firstClickData);
}

function markGamesStarted(state) {
    writeJSON('gamesStarted', state);
}

// ** Wipe Everything Function **
function wipeEverything() {
    console.warn("⚠️ Wiping all stored data...");
    fs.readdirSync(DATA_DIR).forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        try {
            fs.unlinkSync(filePath);
            console.log(`🗑 Deleted: ${filePath}`);
        } catch (error) {
            console.error(`❌ Error deleting file '${filePath}':`, error);
        }
    });
    console.log("✅ All data wiped.");
}

// ** Export the functions for use in other files **
module.exports = {
    fetchMatches,
    fetchTeams,
    fetchTeamData,
    fetchBrackets,
    fetchOfficialStats,
    fetchGamesStarted,
    fetchGameIDCounter,
    fetchFirstClick,
    saveMatches,
    saveTeams,
    saveTeamData,
    saveOfficialStats,
    saveBrackets,
    saveGameIDCounter,
    saveFirstClick,
    markGamesStarted,
    wipeEverything
};