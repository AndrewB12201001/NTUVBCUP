const fs = require('fs');
const path = require('data');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure the `data` directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Utility function to read JSON files
function readJSON(filename) {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    if (!fs.existsSync(filePath)) {
        return null; // File does not exist
    }
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

// Utility function to write JSON files
function writeJSON(filename, data) {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
    }
}

// Fetch Data
function fetchMatches() {
    return readJSON('matches') || [];
}

function fetchTeams() {
    return readJSON('teams') || {};
}

function fetchTeamData() {
    return readJSON('teamData') || {};
}

function fetchBrackets() {
    return readJSON('brackets') || {};
}

function fetchOfficialStats() {
    return readJSON('officialStats') || {};
}

function fetchGamesStarted() {
    return readJSON('gamesStarted') || false;
}

function fetchGameIDCounter() {
    return readJSON('gameIDCounter') || 0;
}

function fetchFirstClick(firstClickKey) {
    const firstClickData = readJSON('firstClick') || {};
    return firstClickData[firstClickKey] || false;
}

// Save Data
function saveMatches(matches) {
    writeJSON('matches', matches);
}

function saveTeams(teams) {
    writeJSON('teams', teams);
}

function saveTeamData(teamData) {
    writeJSON('teamData', teamData);
}

function saveOfficialStats(officialStats) {
    writeJSON('officialStats', officialStats);
}

function saveBrackets(brackets) {
    writeJSON('brackets', brackets);
}

function saveGameIDCounter(gameIDCounter) {
    writeJSON('gameIDCounter', gameIDCounter);
}

function saveFirstClick(firstClickKey, state) {
    let firstClickData = readJSON('firstClick') || {};
    firstClickData[firstClickKey] = state;
    writeJSON('firstClick', firstClickData);
}

function markGamesStarted(state) {
    writeJSON('gamesStarted', state);
}

function wipeEverything() {
    fs.readdirSync(DATA_DIR).forEach(file => {
        fs.unlinkSync(path.join(DATA_DIR, file));
    });
}

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