const mongoose = require('mongoose');
const Template = require('../dataBase/models/Template');
const Admin = require('../dataBase/models/Admin');
require('dotenv').config();

const templates = [
  {
    name: 'Professional Template',
    description: 'A clean and professional design perfect for corporate positions.',
    thumbnail: '/images/templates/professional-thumbnail.jpg',
    preview: '/images/templates/professional-preview.jpg',
    html: '<div class="professional-template"><!-- Template HTML --></div>',
    css: '.professional-template { /* Template CSS */ }',
    isActive: true,
    category: 'professional'
  },
  {
    name: 'Creative Template',
    description: 'A modern and creative design ideal for creative professionals.',
    thumbnail: '/images/templates/creative-thumbnail.jpg',
    preview: '/images/templates/creative-preview.jpg',
    html: '<div class="creative-template"><!-- Template HTML --></div>',
    css: '.creative-template { /* Template CSS */ }',
    isActive: true,
    category: 'creative'
  },
  {
    name: 'Minimal Template',
    description: 'A simple and elegant design that focuses on your content.',
    thumbnail: '/images/templates/minimal-thumbnail.jpg',
    preview: '/images/templates/minimal-preview.jpg',
    html: '<div class="minimal-template"><!-- Template HTML --></div>',
    css: '.minimal-template { /* Template CSS */ }',
    isActive: true,
    category: 'minimal'
  },
  {
    name: 'Modern Template',
    description: 'A contemporary design with a fresh and innovative layout.',
    thumbnail: '/images/templates/modern-thumbnail.jpg',
    preview: '/images/templates/modern-preview.jpg',
    html: '<div class="modern-template"><!-- Template HTML --></div>',
    css: '.modern-template { /* Template CSS */ }',
    isActive: true,
    category: 'modern'
  },
  {
    name: 'Classic Template',
    description: 'A timeless design that never goes out of style.',
    thumbnail: '/images/templates/classic-thumbnail.jpg',
    preview: '/images/templates/classic-preview.jpg',
    html: '<div class="classic-template"><!-- Template HTML --></div>',
    css: '.classic-template { /* Template CSS */ }',
    isActive: true,
    category: 'classic'
  },
  {
    name: 'Academic Template',
    description: 'A formal design suitable for academic and research positions.',
    thumbnail: '/images/templates/academic-thumbnail.jpg',
    preview: '/images/templates/academic-preview.jpg',
    html: '<div class="academic-template"><!-- Template HTML --></div>',
    css: '.academic-template { /* Template CSS */ }',
    isActive: true,
    category: 'academic'
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const admin = await Admin.findOne({ email: 'admin@resumebuilder.com' });
    if (!admin) {
      throw new Error('Admin user not found');
    }

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Add createdBy to each template
    const templatesWithAdmin = templates.map(template => ({
      ...template,
      createdBy: admin._id
    }));

    // Insert new templates
    const insertedTemplates = await Template.insertMany(templatesWithAdmin);
    console.log('Inserted templates:', insertedTemplates.map(t => ({ id: t._id, name: t.name })));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();