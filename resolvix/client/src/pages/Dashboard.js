import React, { useState, useEffect } from 'react';
import { detectConflicts, optimizeAllocations } from '../utils/ConflictDetection';
import './Dashboard.css';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [view, setView] = useState('approved'); // CHANGED: from 'pending' to 'approved'

  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem('requests')) || [];
    const savedResources = JSON.parse(localStorage.getItem('resources')) || [];
    setRequests(savedRequests);
    setResources(savedResources);
    
    // Detect conflicts
    const detectedConflicts = detectConflicts(savedRequests);
    setConflicts(detectedConflicts);
  }, []);

  const handleOptimize = () => {
    const result = optimizeAllocations(requests);
    setOptimizedResult(result);
    setView('approved'); // ADDED: Reset view to 'approved' after optimization
    
    // Save allocations to localStorage
    localStorage.setItem('allocations', JSON.stringify(result.allocations));
    localStorage.setItem('rejected', JSON.stringify(result.rejected));
    localStorage.setItem('rescheduled', JSON.stringify(result.rescheduled));
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === parseInt(resourceId));
    return resource ? resource.name : 'Unknown';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  return (
    <div className="dashboard">
      <h1>Resolvix Dashboard</h1>
      
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="stat-number">{requests.length}</p>
        </div>
        <div className="stat-card">
          <h3>Conflicts Detected</h3>
          <p className="stat-number conflict">{conflicts.length}</p>
        </div>
        <div className="stat-card">
          <h3>Resources</h3>
          <p className="stat-number">{resources.length}</p>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="conflicts-section">
          <h2>⚠️ Conflicts Detected</h2>
          <div className="conflicts-list">
            {conflicts.map((conflict, index) => (
              <div key={index} className="conflict-item">
                <p>
                  <strong>Resource:</strong> {getResourceName(conflict.resourceId)}
                </p>
                <p>Conflict between:</p>
                <ul>
                  <li className={getPriorityClass(conflict.request1.priority)}>
                    {conflict.request1.purpose} ({conflict.request1.priority}) - 
                    {conflict.request1.date} {conflict.request1.startTime}-{conflict.request1.endTime}
                  </li>
                  <li className={getPriorityClass(conflict.request2.priority)}>
                    {conflict.request2.purpose} ({conflict.request2.priority}) - 
                    {conflict.request2.date} {conflict.request2.startTime}-{conflict.request2.endTime}
                  </li>
                </ul>
              </div>
            ))}
          </div>
          
          <button className="optimize-btn" onClick={handleOptimize}>
            Run Optimization Algorithm
          </button>
        </div>
      )}

      {optimizedResult && (
        <div className="optimization-result">
          <h2>📊 Optimization Results</h2>
          
          <div className="result-stats">
            <div className="stat approved">
              <h4>Approved</h4>
              <p>{optimizedResult.allocations.length}</p>
            </div>
            <div className="stat rescheduled">
              <h4>Rescheduled</h4>
              <p>{optimizedResult.rescheduled.length}</p>
            </div>
            <div className="stat rejected">
              <h4>Rejected</h4>
              <p>{optimizedResult.rejected.length}</p>
            </div>
          </div>

          <div className="view-toggle">
            <button 
              className={view === 'approved' ? 'active' : ''} 
              onClick={() => setView('approved')}
            >
              Approved {optimizedResult.allocations.length > 0 && `(${optimizedResult.allocations.length})`}
            </button>
            <button 
              className={view === 'rescheduled' ? 'active' : ''} 
              onClick={() => setView('rescheduled')}
            >
              Rescheduled {optimizedResult.rescheduled.length > 0 && `(${optimizedResult.rescheduled.length})`}
            </button>
            <button 
              className={view === 'rejected' ? 'active' : ''} 
              onClick={() => setView('rejected')}
            >
              Rejected {optimizedResult.rejected.length > 0 && `(${optimizedResult.rejected.length})`}
            </button>
          </div>

          <div className="allocations-table">
            {view === 'approved' && (
              <table>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Purpose</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizedResult.allocations.length > 0 ? (
                    optimizedResult.allocations.map(req => (
                      <tr key={req.id}>
                        <td>{req.resourceName}</td>
                        <td>{req.purpose}</td>
                        <td>{req.date}</td>
                        <td>{req.startTime} - {req.endTime}</td>
                        <td className={getPriorityClass(req.priority)}>{req.priority}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No approved allocations</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {view === 'rescheduled' && (
              <table>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Purpose</th>
                    <th>Original Time</th>
                    <th>Suggested Time</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizedResult.rescheduled.length > 0 ? (
                    optimizedResult.rescheduled.map(req => (
                      <tr key={req.id}>
                        <td>{req.resourceName}</td>
                        <td>{req.purpose}</td>
                        <td>{req.date} {req.startTime}-{req.endTime}</td>
                        <td className="suggested">
                          {req.date} {req.suggestedTime.startTime}-{req.suggestedTime.endTime}
                        </td>
                        <td className={getPriorityClass(req.priority)}>{req.priority}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No rescheduled allocations</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {view === 'rejected' && (
              <table>
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Purpose</th>
                    <th>Requested Time</th>
                    <th>Priority</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {optimizedResult.rejected.length > 0 ? (
                    optimizedResult.rejected.map(req => (
                      <tr key={req.id}>
                        <td>{req.resourceName}</td>
                        <td>{req.purpose}</td>
                        <td>{req.date} {req.startTime}-{req.endTime}</td>
                        <td className={getPriorityClass(req.priority)}>{req.priority}</td>
                        <td>No available slot</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No rejected allocations</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;