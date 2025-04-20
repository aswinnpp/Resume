const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    
  },
  preview: {
    type: String,
   
  },
  html: {
    type: String,
   
  },
  css: {
    type: String,
   
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['professional', 'creative', 'academic', 'technical', 'minimal'],
    default: 'professional'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    
  }
}, { timestamps: true });

// Method to increment usage count
templateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  return this.save();
};

const Template = mongoose.model('Template', templateSchema);

module.exports = Template; 