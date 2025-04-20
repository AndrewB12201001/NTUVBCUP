const Store = require('electron-store').default || require('electron-store');
const store = new Store();
console.log("Electron store path:", store.path);
// FETCH FUNCTIONS

function fetchMatches() {
    let matches = store.get("matches", []);
    if (!matches || !Array.isArray(matches)) {
        console.log("No matches found.");
        saveMatches([]); // initialize if not present
        matches = store.get("matches", []);
    }
    return matches;
}

function fetchTeams(){
    let teams = store.get("teams", {});
    if (!teams || Object.keys(teams).length === 0) {
        console.log("No teams found.");
        saveTeams({});
        teams = store.get("teams", {});
    }
    return teams;
}

function fetchTeamData(){
    let teamData = store.get("teamData", {});
    if (!teamData || Object.keys(teamData).length === 0) {
        console.log("No teamData found.");
        saveTeamData({});
        teamData = store.get("teamData", {});
    }
    return teamData;
}

function fetchBrackets(){
    return store.get("brackets", {});
}

function fetchOfficialStats() {
    return store.get("officialStats", {});
}

function fetchGamesStarted(){
    return store.get("gamesStarted", false);
}

function fetchGameIDCounter(){
    return store.get("gameIDCounter", 0);
}

function fetchFirstClick(firstClickKey){
    return store.get(firstClickKey, false);
}

// SAVE FUNCTIONS

function saveMatches(matches) {
    try {
        store.set("matches", matches);
    } catch (error) {
        console.error("Error saving matches:", error);
    }
}

function saveTeams(teams){
    try {
        store.set("teams", teams);
    } catch (error) {
        console.error("Error saving teams:", error);
    }
}

function saveTeamData(teamData){
    try {
        store.set("teamData", teamData);
    } catch (error) {
        console.error("Error saving teamData:", error);
    }
}

function saveOfficialStats(officialStats){
    try {
        store.set("officialStats", officialStats);
    } catch (error) {
        console.error("Error saving officialStats:", error);
    }
}

function saveBrackets(existingBrackets){
    store.set("brackets", existingBrackets);
}

function saveGameIDCounter(gameIDCounter){
    try {
        store.set("gameIDCounter", gameIDCounter);
    } catch (error) {
        console.error("Error saving gameIDCounter:", error);
    }
}

function saveFirstClick(firstClickKey, state){
    store.set(firstClickKey, state);
}

// OTHER FUNCTIONS

// Mark games started
function markGamesStarted(state) {
    store.set("gamesStarted", state);
}

function wipeEverything(){
    store.clear();
}

function downloadJSON(jsonString, fileName = "data.json") {
    try {
        const jsonObject = jsonString;
        const formattedJSON = JSON.stringify(jsonObject, null, 2);
        const blob = new Blob([formattedJSON], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        console.log("JSON file downloaded successfully!");
    } catch (error) {
        console.error("Unable to parse JSON string:", error);
        alert("The provided string could not be parsed as valid JSON. Please check the formatting.");
    }
}

function matchSetsWonLoss(game, teamID) {
    const sets = [
        game.set1 || [0, 0],
        game.set2 || [0, 0],
        game.set3 || [0, 0]
    ];
    let setsWon = 0;
    let setsLost = 0;
    sets.forEach(set => {
        const [scoreA, scoreB] = set;
        if ((teamID === game.teamAID && scoreA > scoreB) || (teamID === game.teamBID && scoreB > scoreA)) {
            setsWon++;
        } else if (scoreA !== 0 && scoreB !== 0 && ((teamID === game.teamAID && scoreA < scoreB) || (teamID === game.teamBID && scoreB < scoreA))){
            setsLost++;
        }
    });
    return [setsWon, setsLost];
}

function ratioWonLoss(setsWon, setsLost) {
    if (setsLost === 0) return 100;
    return setsWon / setsLost;
}

function matchScoreWonLoss(game, teamID) {
    const sets = [
        game.set1 || [0, 0],
        game.set2 || [0, 0],
        game.set3 || [0, 0]
    ];
    let scoreWon = 0;
    let scoreLost = 0;
    sets.forEach(set => {
        const [scoreA, scoreB] = set;
        if (teamID === game.teamAID) {
            scoreWon += scoreA;
            scoreLost += scoreB;
        } else if (teamID === game.teamBID) {
            scoreWon += scoreB;
            scoreLost += scoreA;
        }
    });
    return [scoreWon, scoreLost];
}

// Preliminary score calculation
function calculatePreliminaryScore() {
    const matches = fetchMatches();
    const teams = fetchTeams();
    Object.values(teams).forEach((team) => {
        let gamesWon = 0;
        let setsTotalResult = [0, 0];
        let scoreTotalResult = [0, 0];
        team.preliminaryScore = 0;
        Object.values(matches).forEach(match => {
            if (match.preliminary === true){
                const matchResult = matchSetsWonLoss(match, team.teamID);
                const scoreResult = matchScoreWonLoss(match, team.teamID);
                if (matchResult[0] > matchResult[1]) gamesWon++;
                setsTotalResult[0] += matchResult[0];
                setsTotalResult[1] += matchResult[1];
                scoreTotalResult[0] += scoreResult[0];
                scoreTotalResult[1] += scoreResult[1];
            }
        });
        team.preliminaryScore = (gamesWon * 100000000 +
            ratioWonLoss(setsTotalResult[0], setsTotalResult[1]) * 10000 +
            ratioWonLoss(scoreTotalResult[0], scoreTotalResult[1]));
    });
    saveTeams(teams);
}

function getTeamRank(teamID) {
    const teams = fetchTeams();
    const team = teams[teamID];
    const group = team.preliminaryGroup;
    const groupTeams = Object.entries(teams)
        .filter(([id, t]) => t.preliminaryGroup === group)
        .sort((a, b) => b[1].preliminaryScore - a[1].preliminaryScore);
    const index = groupTeams.findIndex(([id]) => id === teamID);
    return index + 1;
}

function isPreliminaryMatchesFinished(teamID) {
    const teams = fetchTeams();
    const matches = fetchMatches();
    const team = teams[teamID];
    const group = team.preliminaryGroup;
    for (const m of Object.values(matches)) {
        if (m.preliminary === true && (m.teamAID === teamID || m.teamBID === teamID) && m.status === false) {
            return false;
        }
    }
    return true;
}

// Day sorting
function calculateAvailableDays(unavailableDays) {
    const allDays = [1, 2, 3, 4, 5];
    return allDays.filter(day => !unavailableDays.includes(Number(day)));
}

// Calculate intersection of available days for two teams
function calculateMatchAvailableDays(teamA, teamB) {
    const teams = fetchTeams();
    if (!teams[teamA] || !teams[teamB]) {
        if (!teams[teamA] && !teams[teamB]) {
            return [1, 2, 3, 4, 5];
        } else if (!teams[teamA]) {
            return teams[teamB].availableDays || [1, 2, 3, 4, 5];
        } else if (!teams[teamB]) {
            return teams[teamA].availableDays || [1, 2, 3, 4, 5];
        }
    }
    const teamADays = teams[teamA].availableDays || [1, 2, 3, 4, 5];
    const teamBDays = teams[teamB].availableDays || [1, 2, 3, 4, 5];
    const validTeamADays = Array.isArray(teamADays) ? teamADays : [];
    const validTeamBDays = Array.isArray(teamBDays) ? teamBDays : [];
    return validTeamADays.filter(day => validTeamBDays.includes(day));
}

// Recalculate official stats from matches
function recalculateOfficialStats() {
    const matches = fetchMatches();
    const officialStats = {};
    matches.forEach(match => {
        if (match.official) {
            if (!officialStats[match.official]) {
                officialStats[match.official] = { count: 0 };
            }
            officialStats[match.official].count = (officialStats[match.official].count || 0) + 1;
        }
    });
    const allOfficialStats = fetchOfficialStats();
    for (let official in officialStats) {
        if (allOfficialStats.hasOwnProperty(official)) {
            allOfficialStats[official].count = officialStats[official].count;
        } else {
            allOfficialStats[official] = { count: officialStats[official].count };
        }
    }
    saveOfficialStats(allOfficialStats);
    return officialStats;
}

function updateMatchStatus(match) {
    if (match.teamAID === match.teamBID && match.teamAID !== null) {
        match.status = true;
    } else {
        const hasAllScores = 
            ((match.set1[0] !== 0 || match.set1[1] !== 0) &&
             (match.set2[0] !== 0 || match.set2[1] !== 0));
        const needsSet3 = (
            (match.set1[0] > match.set1[1] && match.set2[0] < match.set2[1]) ||
            (match.set1[0] < match.set1[1] && match.set2[0] > match.set2[1])
        );
        const set3Valid = !needsSet3 || (match.set3[0] !== 0 || match.set3[1] !== 0);
        match.status = hasAllScores && set3Valid;
    }
    return match;
}

function updateMatchWinner(match) {
    let teamASets = 0;
    let teamBSets = 0;
    if (match.set1[0] > match.set1[1]) teamASets++;
    else if (match.set1[1] > match.set1[0]) teamBSets++;
    if (match.set2[0] > match.set2[1]) teamASets++;
    else if (match.set2[1] > match.set2[0]) teamBSets++;
    if (match.set3[0] > match.set3[1]) teamASets++;
    else if (match.set3[1] > match.set3[0]) teamBSets++;
    match.winner = (match.teamAID === match.teamBID && match.teamAID !== null) ? match.teamAID :
                    (teamASets === 0 && teamBSets === 0) ? null :
                    (teamASets >= 2) ? match.teamAID : match.teamBID;
    return match;
}

// Export functions if needed
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
    wipeEverything,
    downloadJSON,
    matchSetsWonLoss,
    ratioWonLoss,
    matchScoreWonLoss,
    calculatePreliminaryScore,
    getTeamRank,
    isPreliminaryMatchesFinished,
    calculateAvailableDays,
    calculateMatchAvailableDays,
    recalculateOfficialStats,
    updateMatchStatus,
    updateMatchWinner
};