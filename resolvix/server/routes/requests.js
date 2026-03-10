const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Resource = require('../models/Resource');
const { detectConflicts, optimizeAllocations } = require('../utils/conflictDetection');

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().populate('resourceId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create request
router.post('/', async (req, res) => {
  try {
    const resource = await Resource.findById(req.body.resourceId);
    const request = new Request({
      ...req.body,
      resourceName: resource.name
    });
    const newRequest = await request.save();
    
    // Check for conflicts
    const existingRequests = await Request.find({ 
      resourceId: req.body.resourceId,
      date: req.body.date,
      status: { $ne: 'Rejected' }
    });
    
    const conflicts = detectConflicts([...existingRequests, newRequest]);
    
    res.status(201).json({
      request: newRequest,
      conflicts: conflicts.length > 0
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Optimize allocations
router.post('/optimize', async (req, res) => {
  try {
    const pendingRequests = await Request.find({ 
      status: 'Pending' 
    }).populate('resourceId');
    
    const result = optimizeAllocations(pendingRequests);
    
    // Update statuses in database
    for (const alloc of result.allocations) {
      await Request.findByIdAndUpdate(alloc._id, { 
        status: 'Approved' 
      });
    }
    
    for (const rej of result.rejected) {
      await Request.findByIdAndUpdate(rej._id, { 
        status: 'Rejected' 
      });
    }
    
    for (const resched of result.rescheduled) {
      await Request.findByIdAndUpdate(resched._id, { 
        status: 'Rescheduled',
        suggestedTime: resched.suggestedTime
      });
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;