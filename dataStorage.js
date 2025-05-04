// Fetch Data

function fetchMatches() {
    let matchesJSON = localStorage.getItem("matches");
    if (!matchesJSON) {
        console.log("No matches found.");
        saveMatches([]);
        matchesJSON = localStorage.getItem("matches");
    }
    try {
        return JSON.parse(matchesJSON);
    } catch (error) {
        console.error("Error parsing matches JSON:", error);
        return [];
    }
}

function fetchTeams(){
    let teamsJSON = localStorage.getItem("teams");
    if (!teamsJSON) {
        console.log("No teams found.");
        saveTeams({});
        teamsJSON = localStorage.getItem("teams");
    }
    try {
        return JSON.parse(teamsJSON);
    } catch (error) {
        console.error("Error parsing teams JSON:", error);
        return {};
    }
}

function fetchTeamData(){// for input
    let teamDataJSON = localStorage.getItem("teamData");
    if (!teamDataJSON) {
        console.log("No teamData found.");
        saveTeamData({});
        teamDataJSON = localStorage.getItem("teamData");
    }try {
        return JSON.parse(teamDataJSON);
    } catch (error) {
        console.error("Error parsing teamData JSON:", error);
        return {};
    }
}

function fetchBrackets(){
    const brackets = JSON.parse(localStorage.getItem('brackets')) || {};
    return brackets;
}

function fetchOfficialStats() {
    const officialStats = JSON.parse(localStorage.getItem('officialStats')) || {};
    return officialStats;
}

function fetchGamesStarted(){
    const hasGamesStarted = localStorage.getItem('gamesStarted') || false;
    return hasGamesStarted;
}

function fetchGameIDCounter(){
    const gameIDCounter = localStorage.getItem('gameIDCounter') || 0;
    return gameIDCounter;
}

function fetchFirstClick(firstClickKey){
    const isFirstClick = localStorage.getItem(firstClickKey) || false;
    return isFirstClick;
}
// Save data

function saveMatches(matches) {
    try {
        const matchesJSON = JSON.stringify(matches);
        localStorage.setItem("matches", matchesJSON);
    } catch (error) {
        console.error("Error saving matches:", error);
    }
}

function saveTeams(teams){
    try {
        const teamsJSON = JSON.stringify(teams);
        localStorage.setItem("teams", teamsJSON);
    } catch (error) {
        console.error("Error saving teams:", error);
    }
}

function saveTeamData(teamData){
    try {
        const teamDataJSON = JSON.stringify(teamData);
        localStorage.setItem("teamData", teamDataJSON);
    } catch (error) {
        console.error("Error saving teamData:", error);
    }
}

function saveOfficialStats(officialStats){
    try {
        const officialsJSON = JSON.stringify(officialStats);
        localStorage.setItem("officialStats", officialsJSON);
    } catch (error) {
        console.error("Error saving officials:", error);
    }
}

function saveBrackets(existingBrackets){
    localStorage.setItem('brackets', JSON.stringify(existingBrackets));
}

function saveGameIDCounter(gameIDCounter){
    try {
        const gameIDCounterJSON = JSON.stringify(gameIDCounter);
        localStorage.setItem("gameIDCounter", gameIDCounterJSON);
    } catch (error) {
        console.error("Error saving gameIDCounter:", error);
    }
}

function saveFirstClick(firstClickKey, state){
    localStorage.setItem(firstClickKey, state);
}

// 標記比賽已開始
function markGamesStarted(state) {
    localStorage.setItem('gamesStarted', state);
}

function wipeEverything(){
    localStorage.clear();
}

function downloadJSON(jsonString, fileName = "data.json") {
    try {
        // 將字串解析為 JSON 格式
        const jsonObject = jsonString;

        // 將 JSON 物件轉換為字串，並設定縮排
        const formattedJSON = JSON.stringify(jsonObject, null, 2);

        // 創建一個 Blob 物件
        const blob = new Blob([formattedJSON], { type: "application/json" });

        // 創建一個臨時的超連結
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        // 觸發下載
        document.body.appendChild(link);
        link.click();

        // 清理資源
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        console.log("JSON 文件已成功下載！");
    } catch (error) {
        console.error("無法解析 JSON 字串:", error);
        alert("提供的字串無法解析為 JSON 格式，請檢查格式是否正確。");
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

    return [setsWon, setsLost]; // Fixed typo
}

function ratioWonLoss(setsWon, setsLost) {
    //console.log('W/L', setsWon, setsLost);
    if (setsLost === 0) return 100;
    return (setsWon)/(setsLost);
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

// preliminary score calculation
function calculatePreliminaryScore() {
    //console.log('Starting preliminary score calculation');

    const matches = fetchMatches();
    const teams = fetchTeams();

    Object.values(teams).forEach((team) => {
        let gamesWon = 0;
        let setsTotalResult = [0, 0];
        let scoreTotalResult = [0, 0];

        team.preliminaryScore = 0;

        Object.values(matches).forEach(match => {
            if (match.preliminary === true){
                const matchResult = matchSetsWonLoss(match, team.teamID); // Fixed function call
                const scoreResult = matchScoreWonLoss(match, team.teamID);

                if (matchResult[0] > matchResult[1]) gamesWon++;
                setsTotalResult[0] += matchResult[0];
                setsTotalResult[1] += matchResult[1];
                scoreTotalResult[0] += scoreResult[0];
                scoreTotalResult[1] += scoreResult[1];
            }
        });
        //console.log(team.teamID, 'gamesWon', gamesWon, setsTotalResult, scoreTotalResult, scoreTotalResult[0]/scoreTotalResult[1]);
        team.preliminaryScore = (gamesWon * 100000000 + ratioWonLoss(setsTotalResult[0], setsTotalResult[1]) * 10000 + ratioWonLoss(scoreTotalResult[0], scoreTotalResult[1]));
        // console.log(`Final preliminary score for ${team.teamID}: ${team.preliminaryScore}`);
    });

    saveTeams(teams);
}

function getTeamRank(team) {
    // first calculate team rank
    const teams = fetchTeams();
    const group = team.preliminaryGroup;
    // Filter teams that are in the same group
    const groupTeams = Object.entries(teams)
        .filter(([id, t]) => t.preliminaryGroup === group)
        // Sort by preliminaryScore descending
        .sort((a, b) => b[1].preliminaryScore - a[1].preliminaryScore);

    // Find the position (index) of the current team in that sorted array
    const index = groupTeams.findIndex(([id]) => id === team.teamID);

    // Return rank (1-based index)
    return index + 1;
}

function isPreliminaryMatchesFinished(teamID) {
    const matches = fetchMatches();
    for (const m of Object.values(matches)) {
        if (m.preliminary === undefined){
            
        }else if (m.preliminary === true && (m.teamAID === teamID || m.teamBID === teamID) && m.status === false) {
            return false;
        }
        
    }
    return true;
}
// day sorting
function calculateAvailableDays(unavailableDays) {
    const allDays = [1, 2, 3, 4, 5];
    return allDays.filter(day => !unavailableDays.includes(Number(day)));
}

// Add this new function to calculate intersection of available days
function calculateMatchAvailableDays(teamA, teamB) {
    const teams = fetchTeams();
    // Check if both teams exist and have availableDays
    if (!teams[teamA] || !teams[teamB]) {
        if(!teams[teamA] && !teams[teamB]){
            return [1, 2, 3, 4, 5];  // Return all days if teams not found
        }else if(!teams[teamA]){
            return teams[teamB].availableDays || [1, 2, 3, 4, 5];
        }else if(!teams[teamB]){
            return teams[teamA].availableDays || [1, 2, 3, 4, 5];
        }
    }

    const teamADays = teams[teamA].availableDays || [1, 2, 3, 4, 5];
    const teamBDays = teams[teamB].availableDays || [1, 2, 3, 4, 5];
    
    //console.log(`TeamA (${teamA}) days:`, teamADays);
    //console.log(`TeamB (${teamB}) days:`, teamBDays);
    
    //const validTeamADays = Array.isArray(teamADays) ? teamADays : [];
    //const validTeamBDays = Array.isArray(teamBDays) ? teamBDays : [];
    return Object.values(teamADays).filter(day => Object.values(teamBDays).includes(day));
}
// save Matches sub functions
function recalculateOfficialStats() {
    const matches = fetchMatches();
    const officialStats = {};
    
    // Count officials from all matches
    matches.forEach(match => {
        if (match.official) {
            if (!officialStats[match.official]) {
                officialStats[match.official] = {count: 0};
            }
            officialStats[match.official].count = (officialStats[match.official].count || 0) + 1;
        }
    });
    const allOfficialStats = fetchOfficialStats()
    // Save updated stats
    // Update count for each official while preserving availableDays if already set
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
    // Check for special case where two teams are the same name
    if(match.teamAID === match.teamBID && match.teamAID !== null) match.status = true;
    else if (match.teamAID === undefined || match.teamBID === undefined  match.status = false;
    else {
        // Check if all sets have valid scores
        const hasAllScores = 
            (match.set1[0] !== 0 || match.set1[1] !== 0) &&  // At least one team scored in set 1
            (match.set2[0] !== 0 || match.set2[1] !== 0);    // At least one team scored in set 2
        
        // For set 3, we only check if it's needed (when each team won one set)
        const needsSet3 = 
            ((match.set1[0] > match.set1[1] && match.set2[0] < match.set2[1]) ||
            (match.set1[0] < match.set1[1] && match.set2[0] > match.set2[1]));
        
        const set3Valid = !needsSet3 || (match.set3[0] !== 0 || match.set3[1] !== 0);

        // Update status if all required sets have scores
        match.status = hasAllScores && set3Valid;
    }
    return match;
}
function updateMatchWinner(match){
    // Calculate sets won by each team
    let teamASets = 0;
    let teamBSets = 0;
    
    // Count sets won
    if (match.set1[0] > match.set1[1]) teamASets++;
    else if (match.set1[1] > match.set1[0]) teamBSets++;
    
    if (match.set2[0] > match.set2[1]) teamASets++;
    else if (match.set2[1] > match.set2[0]) teamBSets++;
    
    if (match.set3[0] > match.set3[1]) teamASets++;
    else if (match.set3[1] > match.set3[0]) teamBSets++;
    
    // Update current match winner
    match.winner = (match.teamAID == match.teamBID && match.teamAID !== null) ? match.teamAID : (teamASets === 0 && teamBSets === 0) ? null : (teamASets >= 2) ? match.teamAID : match.teamBID;
    match.loser = (match.teamAID == match.teamBID && match.teamAID !== null) ? match.teamAID : (teamASets === 0 && teamBSets === 0) ? null : (teamASets >= 2) ? match.teamBID : match.teamAID;
    return match;
}
// save Matches main function
function saveMatches(matches){
    Object.values(matches).forEach((match, index) => {
        // Calculate scores and update status
        match = updateMatchStatus(match);
        match = updateMatchWinner(match);
        match.availableDays = calculateMatchAvailableDays(match.teamAID, match.teamBID);
        // update brackets
        matches = updateBracketsPivotMatch(matches, matches[index]);
    });
    localStorage.setItem("matches", matchesJSON);
    recalculateOfficialStats();
}

function updateBracketsPivotMatch(matches, targetmatch){
    const match = targetmatch;
    // deal with lower level brackets removal
    if (match.nextMatch !== null) {
        const nextMatchId = match.nextMatch;
        const nextMatch = matches.find(m => m.id === nextMatchId);
        if(nextMatch.status === true){
            matches = updateBracketsPivotMatch(matches, nextMatch);
        }
    }
    // Store previous winner before updating
    const previousWinner = match.winner;
    // Store previous loser before updating
    const previousloser = match.loser;
    const previousTeamAID = match.teamAID;
    const previousTeamBID = match.teamBID;
    if (match.status) {
        // Handle next match updates
        if (match.nextMatch !== null) {
            const nextMatchId = match.nextMatch;
            const nextMatch = matches.find(m => m.id === nextMatchId);
            
            if (nextMatch) {
                // If winner changed, update next match
                //console.log('previousWinner', previousWinner, 'currentWinner', match.winner);
                if (previousWinner !== match.winner) {
                    // Remove previous winner from next match and update teams' games array
                    if (nextMatch.teamAID === previousWinner) {
                        // Remove game from previous winner's games array
                        if (teams[previousWinner] && teams[previousWinner].games) {
                            teams[previousWinner].games = teams[previousWinner].games.filter(id => id !== nextMatchId);
                        }
                        
                        // Add game to new winner's games array
                        if (teams[match.winner]) {
                            if (!teams[match.winner].games) {
                                teams[match.winner].games = [];
                            }
                            if (!teams[match.winner].games.includes(nextMatchId)) {
                                teams[match.winner].games.push(nextMatchId);
                            }
                        }
                        
                        nextMatch.teamAID = match.winner;
                        //console.log(`Updated teamA in match ${nextMatchId} from ${previousWinner} to ${match.winner}`);
                    } else if (nextMatch.teamBID === previousWinner) {
                        // Remove game from previous winner's games array
                        if (teams[previousWinner] && teams[previousWinner].games) {
                            teams[previousWinner].games = teams[previousWinner].games.filter(id => id !== nextMatchId);
                        }
                        
                        // Add game to new winner's games array
                        if (teams[match.winner]) {
                            if (!teams[match.winner].games) {
                                teams[match.winner].games = [];
                            }
                            if (!teams[match.winner].games.includes(nextMatchId)) {
                                teams[match.winner].games.push(nextMatchId);
                            }
                        }
                        
                        nextMatch.teamBID = match.winner;
                        //console.log(`Updated teamB in match ${nextMatchId} from ${previousWinner} to ${match.winner}`);
                    } else {
                        console.log('Previous winner not found in next match:', previousWinner, nextMatchId);
                        // If previous winner not found, add to first empty slot
                        if (nextMatch.teamAID === null) {
                            // Add game to new winner's games array
                            if (teams[match.winner]) {
                                if (!teams[match.winner].games) {
                                    teams[match.winner].games = [];
                                }
                                if (!teams[match.winner].games.includes(nextMatchId)) {
                                    teams[match.winner].games.push(nextMatchId);
                                }
                            }
                            
                            nextMatch.teamAID = match.winner;
                            //.log(`Added winner to teamA in match ${nextMatchId}: ${match.winner}`);
                        } else if (nextMatch.teamBID === null) {
                            // Add game to new winner's games array
                            if (teams[match.winner]) {
                                if (!teams[match.winner].games) {
                                    teams[match.winner].games = [];
                                }
                                if (!teams[match.winner].games.includes(nextMatchId)) {
                                    teams[match.winner].games.push(nextMatchId);
                                }
                            }
                            
                            nextMatch.teamBID = match.winner;
                            //console.log(`Added winner to teamB in match ${nextMatchId}: ${match.winner}`);
                        }
                    }
                }
            }
            nextMatch = updateMatchStatus(nextMatch);
            nextMatch = updateMatchWinner(nextMatch);
            if(nextMatch.status === true){
                updateBracketsPivotMatch(matches, nextMatch);
            }
        }if (match.loserNextMatch !== null) {
            const nextMatchId = match.loserNextMatch;
            const nextMatch = matches.find(m => m.id === nextMatchId);
            
            if (nextMatch) {
                // If loser changed, update next match
                if (previousloser !== match.loser) {
                    // Remove previous loser from next match and update teams' games array
                    if (nextMatch.teamAID === previousloser) {
                        // Remove game from previous loser's games array
                        if (teams[previousloser] && teams[previousloser].games) {
                            teams[previousloser].games = teams[previousloser].games.filter(id => id !== nextMatchId);
                        }
                        
                        // Add game to new loser's games array
                        if (teams[match.loser]) {
                            if (!teams[match.loser].games) {
                                teams[match.loser].games = [];
                            }
                            if (!teams[match.loser].games.includes(nextMatchId)) {
                                teams[match.loser].games.push(nextMatchId);
                            }
                        }
                        
                        nextMatch.teamAID = match.loser;
                        //console.log(`Updated teamA in match ${nextMatchId} from ${previousloser} to ${match.loser}`);
                    } else if (nextMatch.teamBID === previousloser) {
                        // Remove game from previous loser's games array
                        if (teams[previousloser] && teams[previousloser].games) {
                            teams[previousloser].games = teams[previousloser].games.filter(id => id !== nextMatchId);
                        }
                        
                        // Add game to new loser's games array
                        if (teams[match.loser]) {
                            if (!teams[match.loser].games) {
                                teams[match.loser].games = [];
                            }
                            if (!teams[match.loser].games.includes(nextMatchId)) {
                                teams[match.loser].games.push(nextMatchId);
                            }
                        }
                        
                        nextMatch.teamBID = match.loser;
                        //console.log(`Updated teamB in match ${nextMatchId} from ${previousloser} to ${match.loser}`);
                    } else {
                        // If previous loser not found, add to first empty slot
                        if (nextMatch.teamAID === null) {
                            // Add game to new loser's games array
                            if (teams[match.loser]) {
                                if (!teams[match.loser].games) {
                                    teams[match.loser].games = [];
                                }
                                if (!teams[match.loser].games.includes(nextMatchId)) {
                                    teams[match.loser].games.push(nextMatchId);
                                }
                            }
                            
                            nextMatch.teamAID = match.loser;
                            //.log(`Added loser to teamA in match ${nextMatchId}: ${match.loser}`);
                        } else if (nextMatch.teamBID === null) {
                            // Add game to new loser's games array
                            if (teams[match.loser]) {
                                if (!teams[match.loser].games) {
                                    teams[match.loser].games = [];
                                }
                                if (!teams[match.loser].games.includes(nextMatchId)) {
                                    teams[match.loser].games.push(nextMatchId);
                                }
                            }
                            
                            nextMatch.teamBID = match.loser;
                            //console.log(`Added loser to teamB in match ${nextMatchId}: ${match.loser}`);
                        }
                    }
                }
            }
            nextMatch = updateMatchStatus(nextMatch);
            nextMatch = updateMatchWinner(nextMatch);
            if(nextMatch.status === true){
                updateBracketsPivotMatch(matches, nextMatch);
            }
        }
    } else {
        if (match.nextMatch !== null) {
            const nextMatchId = match.nextMatch;
            const nextMatch = matches.find(m => m.id === nextMatchId);
            if (nextMatch) {
                if (nextMatch.teamAID === previousTeamAID || nextMatch.teamAID === previousTeamBID) {
                    // Remove game from previous winner's games array
                    if (teams[nextMatch.teamAID] && teams[nextMatch.teamAID].games) {
                        teams[nextMatch.teamAID].games = teams[nextMatch.teamAID].games.filter(id => id !== nextMatchId);
                    }
                    nextMatch.teamAID = null;
                    //console.log(`Removed ${previousWinner} from teamA in match ${nextMatchId}`);
                } else if (nextMatch.teamBID === previousTeamAID || nextMatch.teamBID === previousTeamBID) {
                    // Remove game from previous winner's games array
                    if (teams[nextMatch.teamBID] && teams[nextMatch.teamBID].games) {
                        teams[nextMatch.teamBID].games = teams[nextMatch.teamBID].games.filter(id => id !== nextMatchId);
                    }
                    
                    nextMatch.teamBID = null;
                    //console.log(`Removed ${previousWinner} from teamB in match ${nextMatchId}`);
                }
            }
        }
    }

    return matches;
}

function prepareTeamID(teamID) {
    // Trim the teamID for consistent comparisons.
    return teamID.trim();
}

function updateTeamID(originalTeamID, newTeamID) {
    // -------------------------
    // Update Teams
    // -------------------------
    const teams = fetchTeams();
    if (!(originalTeamID in teams)) {
        console.error(`Team "${originalTeamID}" not found.`);
        return;
    }
    if (newTeamID in teams) {
        console.error(`Team "${newTeamID}" already exists.`);
        return;
    }
    // Update the team record in teams object.
    const newTeams = {};
    Object.keys(teams).forEach(key => {
        if (key === originalTeamID) {
            const teamRecord = teams[originalTeamID];
            teamRecord.teamID = newTeamID; // update team record if applicable
            newTeams[newTeamID] = teamRecord;
        } else {
            newTeams[key] = teams[key];
        }
    });
    saveTeams(newTeams);

    // -------------------------
    // Update teamData (each tier)
    // -------------------------
    const teamData = fetchTeamData();
    // For each tier (e.g., "Tier1-input"), update any occurrence of the original teamID.
    for (const tier in teamData) {
        // Split the tier string into an array of team names.
        const teamList = teamData[tier].split('\n');
        // Map each name: if it matches the original (after trimming), update it.
        const updatedList = teamList.map(name => {
            if (prepareTeamID(name) === prepareTeamID(originalTeamID)) {
                return newTeamID;
            }
            return name;
        });
        // Rejoin the list and update the tier value.
        teamData[tier] = updatedList.join('\n');
    }
    console.log("teamData", teamData);
    saveTeamData(teamData);

    // -------------------------
    // Update Matches (teamAID and teamBID)
    // -------------------------
    const matches = fetchMatches();
    matches.forEach(match => {
        if (match.teamAID === originalTeamID) {
            match.teamAID = newTeamID;
        }
        if (match.teamBID === originalTeamID) {
            match.teamBID = newTeamID;
        }
    });
    saveMatches(matches);

    console.log(`Team ID updated from "${originalTeamID}" to "${newTeamID}".`);
}
