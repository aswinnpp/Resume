const mongoose = require('mongoose');
const User = require('./User');

const adminSchema = new mongoose.Schema({
  isAdmin: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_templates', 'view_analytics', 'manage_settings'],
    default: ['manage_users', 'manage_templates', 'view_analytics']
  }]
});

// Create Admin model that inherits from User
const Admin = User.discriminator('Admin', adminSchema);

module.exports = Admin; 