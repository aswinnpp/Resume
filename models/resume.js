const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    required: true,
    enum: ['template1', 'template2', 'template3']
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String
  },
  summary: String,
  education: [{
    school: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: String,
    description: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: Date,
    endDate: Date,
    description: String,
    achievements: [String]
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String
  }],
  completionStatus: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema); 