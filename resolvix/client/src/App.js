import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ResourceManagement from './pages/ResourceManagement';
import AllocationRequest from './pages/AllocationRequest';
import AllocationSummary from './pages/AllocationSummary';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">Resolvix</div>
          <ul className="nav-links">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/request">New Request</Link></li>
            <li><Link to="/summary">Allocations</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resources" element={<ResourceManagement />} />
          <Route path="/request" element={<AllocationRequest />} />
          <Route path="/summary" element={<AllocationSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;