import React from 'react';

const MatchRow = ({ match, onDelete, onScoreChange, onDateChange, onOfficialChange }) => (
  <div className="match">
    <div className="match-container">
      <label>Game ID: {match.id}</label>
      <label className="group-label">{match.group}</label>
      <label className="team-label">Team A: {match.teamAID}</label>
      <label className="team-label">Team B: {match.teamBID}</label>
      <div className="set-container">
        <label>Set 1:</label>
        <input type="text" maxLength={2} className="score-input" value={match.set1[0] || ''} onChange={e => onScoreChange(match.id, 'set1', 0, e.target.value)} />
        <span>:</span>
        <input type="text" maxLength={2} className="score-input" value={match.set1[1] || ''} onChange={e => onScoreChange(match.id, 'set1', 1, e.target.value)} />
      </div>
      <div className="set-container">
        <label>Set 2:</label>
        <input type="text" maxLength={2} className="score-input" value={match.set2[0] || ''} onChange={e => onScoreChange(match.id, 'set2', 0, e.target.value)} />
        <span>:</span>
        <input type="text" maxLength={2} className="score-input" value={match.set2[1] || ''} onChange={e => onScoreChange(match.id, 'set2', 1, e.target.value)} />
      </div>
      <div className="set-container">
        <label>Set 3:</label>
        <input type="text" maxLength={2} className="score-input" value={match.set3[0] || ''} onChange={e => onScoreChange(match.id, 'set3', 0, e.target.value)} />
        <span>:</span>
        <input type="text" maxLength={2} className="score-input" value={match.set3[1] || ''} onChange={e => onScoreChange(match.id, 'set3', 1, e.target.value)} />
      </div>
      <label className="team-label">Availabledays : {match.availableDays}</label>
      <div className="date-official-container">
        <label>Match date:</label>
        <input type="date" value={match.date || ''} onChange={e => onDateChange(match.id, e.target.value)} />
        <label>Official: </label>
        <input type="text" className="official-search" value={match.official || ''} onChange={e => onOfficialChange(match.id, e.target.value)} placeholder="Search official..." />
      </div>
      <button className="delete-match" onClick={() => onDelete(match.id)}>Delete</button>
    </div>
  </div>
);

export default MatchRow;
