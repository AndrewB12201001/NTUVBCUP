const Tier1quarterFinalMatches = matches.filter(match => match.group === 'Tier1Finals-Round1');
                const Tier2quarterFinalMatches = Tier1quarterFinalMatches.filter(match => match.group === 'Tier2Finals-Round1' && match.teamAID !== match.teamBID);
                const Tier2semiFinalMatches = matches.filter(match => match.group === 'Tier2Finals-Round2');
                // For Tier1, if quarterfinal (first round) finals are finished, show the 5-8 button
                if (tier === "Tier1" && Tier1quarterFinalMatches.length === 4 && Tier1quarterFinalMatches.every(match => match.status === true)) {
                    generateFinalLoserMatches(1);
                }
                // tier2 quarterFinals
                if (tier === "Tier2" && Tier2quarterFinalMatches.length === 4 && Tier2quarterFinalMatches.every(match => match.status === true)) {
                    generateFinalLoserMatches(22);
                }
                // ter2 semiFinals
                if (tier === "Tier2" && Tier2semiFinalMatches.length === 4 && Tier2semiFinalMatches.every(match => match.status === true)) {
                    generateFinalLoserMatches(2);
                }