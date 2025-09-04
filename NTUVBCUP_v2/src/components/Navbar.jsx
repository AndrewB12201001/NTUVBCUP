import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => (
    <nav className="navigation">
        <Link to="/team-profiles" className="nav-link"><i className="fas fa-users"></i>Team Profiles</Link>
        <Link to="/match-list" className="nav-link"><i className="fas fa-calendar-alt"></i>Match List</Link>
        <Link to="/sort-matchings" className="nav-link"><i className="fas fa-sort"></i>Sort Matchings</Link>
        <Link to="/official-profiles" className="nav-link"><i className="fas fa-user-group"></i>Official Profiles</Link>
        <Link to="/visual" className="nav-link"><i className="fas fa-chart-bar"></i>Bracket Visual</Link>
    </nav>
);

export default Navbar;

