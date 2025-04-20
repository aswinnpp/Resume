const mongoose = require('mongoose');
const Admin = require('../dataBase/models/Admin');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const admin = new Admin({
      email: 'admin@resumebuilder.com',
      password: 'admin123',
      name: 'Admin User',
      permissions: ['manage_users', 'manage_templates', 'view_analytics', 'manage_settings']
    });

    await admin.save();
    console.log('Admin user created:', admin._id);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin(); 