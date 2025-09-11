import React, { useEffect, useState } from 'react';

const getTier = (group) => {
  if (!group) return '';
  if (group.startsWith('Tier1')) return 'Tier 1';
  if (group.startsWith('Tier2')) return 'Tier 2';
  if (group.startsWith('Tier3')) return 'Tier 3';
  if (group.startsWith('Tier4')) return 'Tier 4';
  return '';
};

const TeamEntryTables = () => {
  const [teams, setTeams] = useState({});

  useEffect(() => {
    const data = localStorage.getItem('teams');
    if (data) setTeams(JSON.parse(data));
  }, []);

  const tiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];

  return (
    <div>
      <h1>Team Entry Info</h1>
      {tiers.map(tier => {
        const filtered = Object.values(teams).filter(team => getTier(team.preliminaryGroup) === tier);
        if (filtered.length === 0) return null;
        return (
          <div key={tier} style={{ marginBottom: 40 }}>
            <h2>{tier}</h2>
            <table border="1" cellPadding="8" style={{ width: '100%', background: '#fff' }}>
              <thead>
                <tr>
                  <th>Team ID</th>
                  <th>Team Name</th>
                  <th>Preliminary Group</th>
                  <th>Available Days</th>
                  <th>Available Nights</th>
                  <th>Games</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(team => (
                  <tr key={team.teamID}>
                    <td>{team.teamID}</td>
                    <td>{team.teamName}</td>
                    <td>{team.preliminaryGroup}</td>
                    <td>{Array.isArray(team.availableDays) ? team.availableDays.join(', ') : team.availableDays}</td>
                    <td>{Array.isArray(team.availableNights) ? team.availableNights.join(', ') : team.availableNights || ''}</td>
                    <td>{Array.isArray(team.games) ? team.games.join(', ') : team.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default TeamEntryTables;
