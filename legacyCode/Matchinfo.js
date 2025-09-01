function showMatchinfo(matchDiv, match){
    const matches = fetchMatches();
    matchDiv.addEventListener("click", () => {
        document.getElementById("popup-overlay").style.display = 'block';
        document.getElementById("popup").style.display = 'block';
        document.getElementById('popup-content').innerHTML = `
            <h3 class="popup-title">${match.teamAID} vs ${match.teamBID}</h3>
            <div class="match-container">
                <label>Game ID: ${match.id}</label>
                <label class="group-label">Group: ${match.group}</label>
                <label class="group-lavel">Date: ${match.date}</label>
                
                <div class="set-container">
                    <label>Set 1:</label>
                    <input type="text" maxlength="2" class="score-input" data-set="set1" data-team="0" value="${match.set1[0] || ''}">
                    <span>:</span>
                    <input type="text" maxlength="2" class="score-input" data-set="set1" data-team="1" value="${match.set1[1] || ''}">
                </div>

                <div class="set-container">
                    <label>Set 2:</label>
                    <input type="text" maxlength="2" class="score-input" data-set="set2" data-team="0" value="${match.set2[0] || ''}">
                    <span>:</span>
                    <input type="text" maxlength="2" class="score-input" data-set="set2" data-team="1" value="${match.set2[1] || ''}">
                </div>

                <div class="set-container">
                    <label>Set 3:</label>
                    <input type="text" maxlength="2" class="score-input" data-set="set3" data-team="0" value="${match.set3[0] || ''}">
                    <span>:</span>
                    <input type="text" maxlength="2" class="score-input" data-set="set3" data-team="1" value="${match.set3[1] || ''}">
                </div>

                <div class="date-official-container">
                    <label>Official: </label>
                    <div class="official-dropdown">
                        <input type="text" class="official-search" value="${match.official || ''}" data-field="official" placeholder="Search official...">
                        <div class="official-list"></div>
                    </div>
                </div>
                <button id="save-match" class="btn-primary">Save</Button>
                <button id="delete-match" class="btn-secondary">UnDate</button>
            </div>
        `;
        window.currentMatchDate = match.date;
        setupOfficialDropdowns(match);
        
        // Attach event listener after the popup is created
        document.getElementById('save-match').addEventListener('click', () => {
            console.log('Saving match:', match.id);
            
            const matches = fetchMatches();
            const teams = fetchTeams();
            let updated = false;

            // Find the current match in the stored data
            const matchIndex = matches.findIndex(m => m.id === match.id);
            if (matchIndex === -1) return;

            // Get inputs from the popup
            const inputs = popup.querySelectorAll('input');
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                const set = input.getAttribute('data-set');
                const team = input.getAttribute('data-team');

                if (field) {
                    matches[matchIndex][field] = input.value;
                    updated = true;
                } else if (set && team) {
                    if (!matches[matchIndex][set]) matches[matchIndex][set] = [0, 0];
                    matches[matchIndex][set][team] = parseInt(input.value) || 0;
                    updated = true;
                }
            });

            // Calculate scores and update status
            matches[matchIndex] = updateMatchStatus(matches[matchIndex]);

            if (matches[matchIndex].status) {
                const previousWinner = matches[matchIndex].winner;
                let teamASets = 0, teamBSets = 0;

                // Count sets won
                ['set1', 'set2', 'set3'].forEach(set => {
                    if (matches[matchIndex][set]) {
                        if (matches[matchIndex][set][0] > matches[matchIndex][set][1]) teamASets++;
                        else if (matches[matchIndex][set][1] > matches[matchIndex][set][0]) teamBSets++;
                    }
                });

                // Update winner
                matches[matchIndex].winner = (teamASets >= 2) ? matches[matchIndex].teamAID : matches[matchIndex].teamBID;

                // Handle next match
                if (matches[matchIndex].nextMatch !== null) {
                    const nextMatchId = matches[matchIndex].nextMatch;
                    const nextMatch = matches.find(m => m.id === nextMatchId);

                    if (nextMatch && previousWinner !== matches[matchIndex].winner) {
                        if (nextMatch.teamAID === previousWinner) {
                            if (teams[previousWinner]?.games) {
                                teams[previousWinner].games = teams[previousWinner].games.filter(id => id !== nextMatchId);
                            }
                            nextMatch.teamAID = matches[matchIndex].winner;
                        } else if (nextMatch.teamBID === previousWinner) {
                            if (teams[previousWinner]?.games) {
                                teams[previousWinner].games = teams[previousWinner].games.filter(id => id !== nextMatchId);
                            }
                            nextMatch.teamBID = matches[matchIndex].winner;
                        }
                    }
                }
            } else {
                matches[matchIndex].winner = null;
            }

            // Save match Save teams
            saveMatches(matches);
            saveTeams(teams);
            // Debug
            console.log('Match saved:', matches[matchIndex]);
            // close the popup
            document.getElementById("popup-overlay").style.display = 'none';
            document.getElementById("popup").style.display = 'none';
            //rerender the callender
            renderCalendar();
        });
        if(match.locked !== undefined){
            if (match.locked == true){
                document.getElementById('delete-match').style.display = 'none';
            }
        }
        document.getElementById('delete-match').addEventListener('click', () => {
            // Find the current match in the stored data
            if(match.locked !== undefined){
                if (match.locked == true){
                    alert('Match is locked. Cannot delete.');
                    return;
                }
            }
            const matchIndex = matches.findIndex(m => m.id === match.id);
            if (matchIndex === -1) return;
            matches[matchIndex].date = null;
            saveMatches(matches);
            console.log('Match saved:', matches[matchIndex]);
            // close the popup
            document.getElementById("popup-overlay").style.display = 'none';
            document.getElementById("popup").style.display = 'none';
            renderCalendar();
        });

        // **popup**
        // Close the popup by clicking outside the popup
        document.getElementById("popup-overlay").addEventListener("click", () => {
            document.getElementById('save-match').click();
            document.getElementById("popup-overlay").style.display = 'none';
            document.getElementById("popup").style.display = 'none';
        })

        // Add these new functions to handle the official dropdown functionality

        function setupOfficialDropdowns(match) {
            const searchInputs = document.querySelectorAll('.official-search');
            
            searchInputs.forEach(input => {
                const dropdownList = input.nextElementSibling;
                const officialStats = fetchOfficialStats();

                // Show dropdown on focus
                input.addEventListener('click', () => {
                    updateOfficialList(dropdownList, input.value, officialStats, match);
                    dropdownList.style.display = 'block';
                });

                // Handle input changes
                input.addEventListener('input', () => {
                    updateOfficialList(dropdownList, input.value, officialStats, match);
                    console.log('updatedOfficialList from here');
                });

                // When the input value changes, update the match official in storage
                input.addEventListener('change', () => {
                    const matches = fetchMatches();
                    const matchIndex = matches.findIndex(m => m.id === match.id);
                    const previousOfficial = matches[matchIndex].official;
                    const newOfficial = input.value;
                    
                    // Update match official
                    matches[matchIndex].official = newOfficial;
                    saveMatches(matches);
                    console.log(`Updated official from ${previousOfficial} to ${newOfficial}`);
                });
            });
        }

        function updateOfficialList(dropdownList, searchText, officialStats, match) {
            const matches = fetchMatches();
            dropdownList.innerHTML = '';
            const officials = Object.keys(officialStats);
            
            // Get the day of week for the current match date
            const matchDay = new Date(match.date).getDay();
            
            const filteredOfficials = officials.filter(official => {
                if (officialStats[official].availableDays === undefined) {
                    return true;
                } else {
                    return official.toLowerCase().includes(searchText.toLowerCase()) &&
                           officialStats[official].availableDays.includes(matchDay);
                }
            });
            console.log(filteredOfficials);

            filteredOfficials.forEach(official => {
                const div = document.createElement('div');
                div.textContent = `${official} (${officialStats[official].count} games)`;
                // Add CSS styles directly to the element
                div.style.cursor = 'default';
                div.style.transition = 'background-color 0.2s';
                
                // Add hover event listeners
                div.addEventListener('mouseenter', () => {
                    div.style.backgroundColor = '#e0e0e0';
                });
                div.addEventListener('mouseleave', () => {
                    div.style.backgroundColor = '';
                });
                
                div.addEventListener('click', () => {
                    const input = dropdownList.previousElementSibling;
                    const matchIndex = matches.findIndex(m => m.id === match.id);
                    const previousOfficial = matches[matchIndex].official;
                    
                    // Update input and match
                    input.value = official;
                    matches[matchIndex].official = official;
                    saveMatches(matches);

                    // Refresh the dropdown with updated stats
                    updateOfficialList(dropdownList, official, officialStats, match);
                    console.log(`Updated official from ${previousOfficial} to ${official}`);
                    
                    dropdownList.style.display = 'none';
                });
                dropdownList.appendChild(div);
            });

            // Add option for new official if the search text does not match any existing official
            if (!filteredOfficials.some(off => off.toLowerCase() === searchText.toLowerCase()) && searchText.trim() !== '') {
                const div = document.createElement('div');
                div.textContent = `Add new: ${searchText}`;
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    const input = dropdownList.previousElementSibling;
                    const matchIndex = matches.findIndex(m => m.id === match.id);
                    const previousOfficial = matches[matchIndex].official;
                    
                    // Update input and match
                    input.value = searchText;
                    matches[matchIndex].official = searchText;
                    saveMatches(matches);
                    
                    // Refresh all dropdowns with updated stats
                    document.querySelectorAll('.official-search').forEach(searchInput => {
                        const list = searchInput.nextElementSibling;
                        updateOfficialList(list, searchInput.value, officialStats, match);
                        console.log('updatedOfficialList from here');
                    });
                    
                    dropdownList.style.display = 'none';
                    console.log(`Added new official: ${searchText}`);
                });
                dropdownList.appendChild(div);
            }

            dropdownList.style.display = (filteredOfficials.length > 0 || searchText.trim() === '') ? 'block' : 'none';
            dropdownList.addEventListener('mousedown', (event) => {
                event.stopPropagation();
            });
        }
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', function(e) {
                // Only allow numbers
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Auto-advance when two digits are entered
                if (this.value.length === 2) {
                    const allInputs = Array.from(document.querySelectorAll('.score-input'));
                    const currentIndex = allInputs.indexOf(this);
                    if (currentIndex < allInputs.length - 1) {
                        allInputs[currentIndex + 1].focus();console.log('here');
                    }
                }
            });

            // Add keyboard navigation
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value.length === 0) {
                    const allInputs = Array.from(document.querySelectorAll('.score-input'));
                    const currentIndex = allInputs.indexOf(this);
                    if (currentIndex > 0) {
                        e.preventDefault();
                        allInputs[currentIndex - 1].focus();
                    }
                }
            });
        });
    });
}