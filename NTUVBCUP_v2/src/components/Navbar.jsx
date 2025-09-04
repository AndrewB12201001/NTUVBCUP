import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="navigation">
    <Link to="/" className="nav-link">Calendar</Link>
    <Link to="/match-list" className="nav-link">Match List</Link>
    <Link to="/sort-matchings" className="nav-link">Sort Matchings</Link>
    <Link to="/team-profiles" className="nav-link">Team Profiles</Link>
    <Link to="/official-profiles" className="nav-link">Official Profiles</Link>
    <Link to="/visual" className="nav-link">Bracket Visual</Link>
    <Link to="/input-play-groups" className="nav-link">Input Play Groups</Link>
  </nav>
);

export default Navbar;
