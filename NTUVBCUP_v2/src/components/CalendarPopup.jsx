import React from 'react';

const CalendarPopup = ({ visible, onClose, children }) => {
  if (!visible) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default CalendarPopup;
