import React from 'react';
import MatchRow from './MatchRow';

const MatchList = ({ matches, onDelete, onScoreChange, onDateChange, onOfficialChange }) => (
  <div className="matches-container-wrapper">
    <div className="scrollable-matches">
      {matches.map(match => (
        <MatchRow
          key={match.id}
          match={match}
          onDelete={onDelete}
          onScoreChange={onScoreChange}
          onDateChange={onDateChange}
          onOfficialChange={onOfficialChange}
        />
      ))}
    </div>
    <div className="fixed-save-bar">
      <button className="save-all-button">Save All Changes</button>
    </div>
  </div>
);

export default MatchList;
