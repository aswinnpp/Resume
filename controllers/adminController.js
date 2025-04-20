const User = require('../dataBase/models/User');
const Admin = require('../dataBase/models/Admin');
const Template = require('../dataBase/models/Template');
const Resume = require('../dataBase/models/Resume');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'public/images/templates';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'preview', maxCount: 1 }
]);

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      req.flash('error', 'Please login to access this page');
      return res.redirect('/login');
    }
    
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      req.flash('error', 'You do not have permission to access this page');
      return res.redirect('/dashboard');
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    req.flash('error', 'An error occurred');
    res.redirect('/dashboard');
  }
};

// Admin dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Get statistics
    const stats = {
      userCount: await User.countDocuments(),
      resumeCount: await Resume.countDocuments(),
      templateCount: await Template.countDocuments(),
      activeUserCount: await User.countDocuments({ isActive: true })
    };

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    // Get popular templates
    const popularTemplates = await Template.aggregate([
      {
        $lookup: {
          from: 'resumes',
          localField: '_id',
          foreignField: 'template',
          as: 'resumes'
        }
      },
      {
        $project: {
          name: 1,
          usageCount: { $size: '$resumes' }
        }
      },
      {
        $sort: { usageCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.render('admin/dashboard', {
      stats,
      recentUsers,
      popularTemplates
    });
  } catch (error) {
    console.error('Error in admin dashboard:', error);
    req.flash('error', 'An error occurred while loading the dashboard');
    res.redirect('/');
  }
};

// User management
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-password');

    res.render('admin/users', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    req.flash('error', 'An error occurred while fetching users');
    res.redirect('/admin/dashboard');
  }
};

// Block/unblock user
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user status'
    });
  }
};

// Template management
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.render('admin/templates', { templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    req.flash('error', 'An error occurred while fetching templates');
    res.redirect('/admin/dashboard');
  }
};

// Add template page
exports.getAddTemplate = (req, res) => {
  res.render('admin/template-form', { template: null });
};

// Edit template page
exports.getEditTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      req.flash('error', 'Template not found');
      return res.redirect('/admin/templates');
    }
    res.render('admin/template-form', { template });
  } catch (error) {
    console.error('Error fetching template:', error);
    req.flash('error', 'An error occurred while fetching template');
    res.redirect('/admin/templates');
  }
};

// Create template
exports.createTemplate = async (req, res) => {
  try {
    const { name, description, html, css } = req.body;
    const template = new Template({
      name,
      description,
      html,
      css
    });
    await template.save();
    req.flash('success', 'Template created successfully');
    res.redirect('/admin/templates');
  } catch (error) {
    console.error('Error creating template:', error);
    req.flash('error', 'An error occurred while creating template');
    res.redirect('/admin/templates/add');
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { name, description, html, css } = req.body;
    const template = await Template.findById(req.params.id);
    if (!template) {
      req.flash('error', 'Template not found');
      return res.redirect('/admin/templates');
    }

    template.name = name;
    template.description = description;
    template.html = html;
    template.css = css;
    await template.save();

    req.flash('success', 'Template updated successfully');
    res.redirect('/admin/templates');
  } catch (error) {
    console.error('Error updating template:', error);
    req.flash('error', 'An error occurred while updating template');
    res.redirect(`/admin/templates/edit/${req.params.id}`);
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.remove();
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting template'
    });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Get user growth over time
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get resume creation trends
    const resumeTrends = await Resume.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get template usage statistics
    const templateStats = await Template.aggregate([
      {
        $lookup: {
          from: 'resumes',
          localField: '_id',
          foreignField: 'template',
          as: 'resumes'
        }
      },
      {
        $project: {
          name: 1,
          usageCount: { $size: '$resumes' }
        }
      },
      { $sort: { usageCount: -1 } }
    ]);

    res.render('admin/analytics', {
      userGrowth,
      resumeTrends,
      templateStats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    req.flash('error', 'An error occurred while fetching analytics');
    res.redirect('/admin/dashboard');
  }
}; 