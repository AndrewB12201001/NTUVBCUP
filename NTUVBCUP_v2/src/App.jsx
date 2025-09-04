import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calendar from './components/Calendar';
import MatchList from './components/MatchList';
import SortMatchings from './components/SortMatchings';
import TeamProfiles from './components/TeamProfiles';
import OfficialProfiles from './components/OfficialProfiles';
import Visual from './components/Visual';
import InputPlayGroups from './components/InputPlayGroups';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/match-list" element={<MatchList />} />
        <Route path="/sort-matchings" element={<SortMatchings />} />
        <Route path="/team-profiles" element={<TeamProfiles />} />
        <Route path="/official-profiles" element={<OfficialProfiles />} />
        <Route path="/visual" element={<Visual />} />
        <Route path="/input-play-groups" element={<InputPlayGroups />} />
      </Routes>
    </Router>
  );
}

export default App;