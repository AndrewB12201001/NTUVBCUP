import React from 'react';

const MatchItem = ({ match, onLockToggle, onDragStart, onDragEnd }) => {
  const locked = match.locked;
  return (
    <div
      className={`calendar-match${locked ? ' locked' : ''}`}
      draggable={!locked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseDown={onLockToggle}
      style={{ background: match.status ? '#63d67e' : (match.set1?.[0] !== 0 && match.set1?.[1] !== 0) ? '#CCCCFF' : '' }}
    >
      {locked ? '🔒' : ''}{match.group}: {match.teamAID} vs {match.teamBID}
    </div>
  );
};

export default MatchItem;
