import React, { useState, useEffect } from 'react';
import './ResourceManagement.css';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'Room',
    capacity: '',
    availability: { start: '09:00', end: '17:00' }
  });

  // Load resources from localStorage (temporary)
  useEffect(() => {
    const savedResources = JSON.parse(localStorage.getItem('resources')) || [];
    setResources(savedResources);
  }, []);

  const resourceTypes = ['Room', 'Lab', 'Seminar Hall', 'Fest Stall', 'Stage Slot'];

  const handleAddResource = () => {
    const resource = {
      id: Date.now(),
      ...newResource,
      capacity: parseInt(newResource.capacity)
    };
    
    const updatedResources = [...resources, resource];
    setResources(updatedResources);
    localStorage.setItem('resources', JSON.stringify(updatedResources));
    
    setNewResource({
      name: '',
      type: 'Room',
      capacity: '',
      availability: { start: '09:00', end: '17:00' }
    });
  };

  const handleDeleteResource = (id) => {
    const updatedResources = resources.filter(r => r.id !== id);
    setResources(updatedResources);
    localStorage.setItem('resources', JSON.stringify(updatedResources));
  };

  return (
    <div className="resource-management">
      <h1>Resource Management</h1>
      
      <div className="add-resource-form">
        <h2>Add New Resource</h2>
        <input
          type="text"
          placeholder="Resource Name"
          value={newResource.name}
          onChange={(e) => setNewResource({...newResource, name: e.target.value})}
        />
        
        <select
          value={newResource.type}
          onChange={(e) => setNewResource({...newResource, type: e.target.value})}
        >
          {resourceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <input
          type="number"
          placeholder="Capacity"
          value={newResource.capacity}
          onChange={(e) => setNewResource({...newResource, capacity: e.target.value})}
        />
        
        <div className="time-range">
          <input
            type="time"
            value={newResource.availability.start}
            onChange={(e) => setNewResource({
              ...newResource, 
              availability: {...newResource.availability, start: e.target.value}
            })}
          />
          <span>to</span>
          <input
            type="time"
            value={newResource.availability.end}
            onChange={(e) => setNewResource({
              ...newResource, 
              availability: {...newResource.availability, end: e.target.value}
            })}
          />
        </div>
        
        <button onClick={handleAddResource}>Add Resource</button>
      </div>

      <div className="resources-list">
        <h2>Available Resources</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.name}</td>
                <td>{resource.type}</td>
                <td>{resource.capacity}</td>
                <td>{resource.availability.start} - {resource.availability.end}</td>
                <td>
                  <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceManagement;