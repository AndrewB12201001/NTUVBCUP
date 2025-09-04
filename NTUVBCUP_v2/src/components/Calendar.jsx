import React, { useState } from 'react';
import './Calendar.css';
import CalendarPopup from './CalendarPopup';
import MatchItem from './MatchItem';

// Dummy fetchMatches and saveMatches for demonstration
const fetchMatches = () => [];
const saveMatches = matches => {};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [popupDate, setPopupDate] = useState(null);
  const matches = fetchMatches();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const getDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days = [];
    // Previous month padding
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateStr = getDateStr(prevMonthYear, prevMonth, day);
      days.push(renderDay(day, true, dateStr));
    }
    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = getDateStr(year, month, day);
      days.push(renderDay(day, false, dateStr));
    }
    // Next month padding
    const lastDayOfWeek = lastDay.getDay();
    const nextMonthYear = (month + 1 > 11) ? year + 1 : year;
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const dateStr = getDateStr(nextMonthYear, (month + 1) % 12, i);
      days.push(renderDay(i, true, dateStr));
    }
    return days;
  };

  const renderDay = (day, isOtherMonth, dateStr) => {
    const dayMatches = matches.filter(match => match.date === dateStr);
    return (
      <div
        key={dateStr}
        className={`calendar-day${isOtherMonth ? ' other-month' : ''}`}
        style={{ cursor: 'pointer' }}
        onDoubleClick={() => setPopupDate(dateStr)}
      >
        <div className="calendar-date">{day}</div>
        <div className="calendar-matches">
          {dayMatches.map(match => (
            <MatchItem key={match.id} match={match} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="action-btn" onClick={handlePrevMonth}>Previous Month</button>
        <h2 id="current-month">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button className="action-btn" onClick={handleNextMonth}>Next Month</button>
      </div>
      <div className="calendar-grid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
      </div>
      <div id="calendar-days">
        {renderDays()}
      </div>
      <CalendarPopup visible={!!popupDate} onClose={() => setPopupDate(null)}>
        {/* Popup content for {popupDate} goes here */}
        <div>Popup for {popupDate}</div>
      </CalendarPopup>
    </div>
  );
};

export default Calendar;
