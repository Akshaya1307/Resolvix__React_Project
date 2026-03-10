import React, { useState, useEffect } from 'react';
import './AllocationSummary.css';

const AllocationSummary = () => {
  const [allocations, setAllocations] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [rescheduled, setRescheduled] = useState([]);
  const [utilizationStats, setUtilizationStats] = useState({});

  useEffect(() => {
    const savedAllocations = JSON.parse(localStorage.getItem('allocations')) || [];
    const savedRejected = JSON.parse(localStorage.getItem('rejected')) || [];
    const savedRescheduled = JSON.parse(localStorage.getItem('rescheduled')) || [];
    const savedResources = JSON.parse(localStorage.getItem('resources')) || [];
    
    setAllocations(savedAllocations);
    setRejected(savedRejected);
    setRescheduled(savedRescheduled);
    
    calculateUtilization(savedAllocations, savedResources);
  }, []);

  const calculateUtilization = (allocations, resources) => {
    const stats = {};
    
    resources.forEach(resource => {
      const resourceAllocations = allocations.filter(a => a.resourceId === resource.id.toString());
      const totalHours = resourceAllocations.reduce((total, alloc) => {
        const start = new Date(`2000-01-01T${alloc.startTime}`);
        const end = new Date(`2000-01-01T${alloc.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
      
      stats[resource.id] = {
        name: resource.name,
        totalAllocations: resourceAllocations.length,
        totalHours: totalHours.toFixed(1),
        utilizationRate: ((totalHours / 24) * 100).toFixed(1) // Simplified
      };
    });
    
    setUtilizationStats(stats);
  };

  return (
    <div className="allocation-summary">
      <h1>Allocation Summary</h1>
      
      <div className="summary-cards">
        <div className="summary-card approved">
          <h3>Total Approved</h3>
          <p className="big-number">{allocations.length}</p>
        </div>
        <div className="summary-card rescheduled">
          <h3>Rescheduled</h3>
          <p className="big-number">{rescheduled.length}</p>
        </div>
        <div className="summary-card rejected">
          <h3>Rejected</h3>
          <p className="big-number">{rejected.length}</p>
        </div>
      </div>

      <div className="utilization-section">
        <h2>Resource Utilization</h2>
        <div className="utilization-grid">
          {Object.values(utilizationStats).map(stat => (
            <div key={stat.name} className="utilization-card">
              <h4>{stat.name}</h4>
              <div className="utilization-bar">
                <div 
                  className="utilization-fill" 
                  style={{width: `${stat.utilizationRate}%`}}
                ></div>
              </div>
              <div className="utilization-details">
                <span>Allocations: {stat.totalAllocations}</span>
                <span>Hours: {stat.totalHours}</span>
                <span>Rate: {stat.utilizationRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="final-allocations">
        <h2>Final Allocations</h2>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Purpose</th>
              <th>Date</th>
              <th>Time</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map(alloc => (
              <tr key={alloc.id}>
                <td>{alloc.resourceName}</td>
                <td>{alloc.purpose}</td>
                <td>{alloc.date}</td>
                <td>{alloc.startTime} - {alloc.endTime}</td>
                <td className={`priority-${alloc.priority.toLowerCase()}`}>
                  {alloc.priority}
                </td>
                <td className="status-approved">Approved</td>
              </tr>
            ))}
            {rescheduled.map(alloc => (
              <tr key={alloc.id}>
                <td>{alloc.resourceName}</td>
                <td>{alloc.purpose}</td>
                <td>{alloc.date}</td>
                <td>
                  <span className="original-time">{alloc.startTime}-{alloc.endTime}</span>
                  → 
                  <span className="new-time">
                    {alloc.suggestedTime.startTime}-{alloc.suggestedTime.endTime}
                  </span>
                </td>
                <td className={`priority-${alloc.priority.toLowerCase()}`}>
                  {alloc.priority}
                </td>
                <td className="status-rescheduled">Rescheduled</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocationSummary;