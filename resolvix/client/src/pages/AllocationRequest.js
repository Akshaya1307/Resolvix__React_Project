import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllocationRequest.css';

const AllocationRequest = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState({
    resourceId: '',
    resourceName: '',
    date: '',
    startTime: '',
    endTime: '',
    priority: 'Medium',
    purpose: ''
  });

  useEffect(() => {
    const savedResources = JSON.parse(localStorage.getItem('resources')) || [];
    const savedRequests = JSON.parse(localStorage.getItem('requests')) || [];
    setResources(savedResources);
    setRequests(savedRequests);
  }, []);

  const priorities = ['High', 'Medium', 'Low'];

  const handleResourceSelect = (e) => {
    const selectedResource = resources.find(r => r.id === parseInt(e.target.value));
    setCurrentRequest({
      ...currentRequest,
      resourceId: e.target.value,
      resourceName: selectedResource ? selectedResource.name : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newRequest = {
      id: Date.now(),
      ...currentRequest,
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    const updatedRequests = [...requests, newRequest];
    setRequests(updatedRequests);
    localStorage.setItem('requests', JSON.stringify(updatedRequests));
    
    alert('Request submitted successfully!');
    navigate('/');
  };

  return (
    <div className="allocation-request">
      <h1>New Allocation Request</h1>
      
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label>Select Resource:</label>
          <select value={currentRequest.resourceId} onChange={handleResourceSelect} required>
            <option value="">Choose a resource</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.type}) - Capacity: {resource.capacity}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={currentRequest.date}
            onChange={(e) => setCurrentRequest({...currentRequest, date: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="time-group">
          <div className="form-group">
            <label>Start Time:</label>
            <input
              type="time"
              value={currentRequest.startTime}
              onChange={(e) => setCurrentRequest({...currentRequest, startTime: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time:</label>
            <input
              type="time"
              value={currentRequest.endTime}
              onChange={(e) => setCurrentRequest({...currentRequest, endTime: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Priority:</label>
          <select
            value={currentRequest.priority}
            onChange={(e) => setCurrentRequest({...currentRequest, priority: e.target.value})}
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Purpose/Event:</label>
          <textarea
            value={currentRequest.purpose}
            onChange={(e) => setCurrentRequest({...currentRequest, purpose: e.target.value})}
            rows="3"
            required
          />
        </div>

        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default AllocationRequest;