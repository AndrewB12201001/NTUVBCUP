const Store = require('electron-store');
const fs = require('fs');
const path = require('path');

function loadJSON(fileName, defaultValue) {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'LocalStorageBack', fileName), 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Failed to read ${fileName}:`, err);
        return defaultValue;
    }
}

function migrate() {
    const store = new Store();

    const matches = loadJSON('matches.json', []);
    const teams = loadJSON('teams.json', {});
    const teamData = loadJSON('teamData.json', {});
    const officialStats = loadJSON('officialStats.json', {});
    const brackets = loadJSON('brackets.json', {});
    const gameIDCounter = loadJSON('gameIDCounter.json', 0);

    store.set('matches', matches);
    store.set('teams', teams);
    store.set('teamData', teamData);
    store.set('officialStats', officialStats);
    store.set('brackets', brackets);
    store.set('gameIDCounter', gameIDCounter);

    console.log('✅ Migration from LocalStorageBack completed!');
}

// call it from your Electron main process
migrate();