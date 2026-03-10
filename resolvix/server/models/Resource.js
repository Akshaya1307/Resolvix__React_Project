const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Room', 'Lab', 'Seminar Hall', 'Fest Stall', 'Stage Slot'],
    required: true 
  },
  capacity: { type: Number, required: true },
  availability: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);