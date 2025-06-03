const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  dateFrom: {
    type: Date,
    required: true
  },
  dateTo: {
    type: Date,
    required: true
  },
  periodType: {
    type: String,
    enum: ['weekly', 'monthly', 'custom'],
    required: true
  },
  reportData: {
    type: String, // Store as JSON string
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    default: null
  },
  supportAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reportType:{
    type:String,
    enum:['SALES','AGENTS']
  }
});

// Create compound index for efficient lookups
reportSchema.index({ 
  dateFrom: 1, 
  dateTo: 1, 
  periodType: 1, 
  locationId: 1, 
  carId: 1, 
  supportAgentId: 1 
});

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);