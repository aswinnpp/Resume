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
    let dir;
    if (file.fieldname === 'template') {
      dir = 'public/templates';
    } else {
      dir = 'public/images/templates';
    }
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
    if (file.fieldname === 'template') {
      // Allow .ejs files for templates
      const filetypes = /ejs/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      } else {
        cb('Error: Only .ejs files are allowed for templates!');
      }
    } else {
      // For preview/thumbnail images
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb('Error: Images only for preview/thumbnail!');
      }
    }
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'preview', maxCount: 1 },
  { name: 'template', maxCount: 1 }
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

// Get templates management page
exports.getTemplates = async (req, res) => {
    try {
        // Get all templates
        const templates = await Template.find().sort({ createdAt: -1 });
        
        // Get stats for the dashboard
        const stats = {
            totalTemplates: templates.length,
            activeTemplates: templates.filter(t => t.isActive).length,
            totalResumes: await Resume.countDocuments(),
            totalUsers: await User.countDocuments()
        };
        
        res.render('admin/templates', {
            templates,
            stats,
            title: 'Manage Templates'
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        req.flash('error', 'Failed to load templates');
        res.redirect('/admin');
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
    // Check if user is authenticated
    if (!req.user) {
      req.flash('error', 'You must be logged in to create a template');
      return res.redirect('/login');
    }

    upload(req, res, async function(err) {
      if (err) {
        console.error('Upload error:', err);
        req.flash('error', 'Error uploading files: ' + err.message);
        return res.redirect('/admin/templates/add');
      }

      try {
        const { name, description, html, css, isActive, category } = req.body;
        
        let templateHtml = html;
        let templateCss = css;

        // If a template file was uploaded, read its contents
        if (req.files && req.files.template) {
          const templateFile = req.files.template[0];
          const templateContent = fs.readFileSync(templateFile.path, 'utf8');
          
          // Extract HTML and CSS from the template file
          const styleMatch = templateContent.match(/<style>([\s\S]*?)<\/style>/);
          const bodyMatch = templateContent.match(/<body>([\s\S]*?)<\/body>/);
          
          if (styleMatch && bodyMatch) {
            templateCss = styleMatch[1].trim();
            templateHtml = bodyMatch[1].trim();
          } else {
            templateHtml = templateContent;
          }

          // Delete the uploaded file as we've extracted its contents
          fs.unlinkSync(templateFile.path);
        }

        // Create new template
        const template = new Template({
          name,
          description,
          html: templateHtml,
          css: templateCss,
          isActive: isActive === 'true',
          category,
          createdBy: req.user._id || req.user.id, // Handle both possible user ID fields
          preview: req.files?.preview?.[0]?.filename || 'default-preview.jpg' // Add default preview if none provided
        });

        await template.save();
        req.flash('success', 'Template created successfully');
        res.redirect('/admin/templates');
      } catch (error) {
        console.error('Error saving template:', error);
        req.flash('error', 'An error occurred while creating template: ' + error.message);
        res.redirect('/admin/templates/add');
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    req.flash('error', 'An error occurred while creating template: ' + error.message);
    res.redirect('/admin/templates/add');
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        console.error('Upload error:', err);
        req.flash('error', 'Error uploading files: ' + err.message);
        return res.redirect(`/admin/templates/edit/${req.params.id}`);
      }

      try {
        const { name, description, html, css, isActive, category } = req.body;
        const template = await Template.findById(req.params.id);
        
        if (!template) {
          req.flash('error', 'Template not found');
          return res.redirect('/admin/templates');
        }

        let templateHtml = html;
        let templateCss = css;

        // If a template file was uploaded, read its contents
        if (req.files && req.files.template) {
          const templateFile = req.files.template[0];
          const templateContent = fs.readFileSync(templateFile.path, 'utf8');
          
          // Extract HTML and CSS from the template file
          const styleMatch = templateContent.match(/<style>([\s\S]*?)<\/style>/);
          const bodyMatch = templateContent.match(/<body>([\s\S]*?)<\/body>/);
          
          if (styleMatch && bodyMatch) {
            templateCss = styleMatch[1].trim();
            templateHtml = bodyMatch[1].trim();
          } else {
            templateHtml = templateContent;
          }

          // Delete the uploaded file as we've extracted its contents
          fs.unlinkSync(templateFile.path);
        }

        // Update template fields
        template.name = name;
        template.description = description;
        template.html = templateHtml;
        template.css = templateCss;
        template.isActive = isActive === 'true';
        template.category = category;

        // Handle preview image update
        if (req.files && req.files.preview) {
          // Delete old preview file if it exists
          if (template.preview) {
            const oldPath = path.join(__dirname, '../public/images/templates/', template.preview);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
          template.preview = req.files.preview[0].filename;
        }

        await template.save();
        req.flash('success', 'Template updated successfully');
        res.redirect('/admin/templates');
      } catch (error) {
        console.error('Error updating template:', error);
        req.flash('error', 'An error occurred while updating template');
        res.redirect(`/admin/templates/edit/${req.params.id}`);
      }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    req.flash('error', 'An error occurred while updating template');
    res.redirect(`/admin/templates/edit/${req.params.id}`);
  }
};

// Preview template
exports.previewTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create a sample resume data for preview
    const sampleResume = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        location: 'New York, NY',
        summary: 'Experienced professional with expertise in web development and project management.'
      },
      education: [{
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Technology',
        location: 'New York, NY',
        startDate: '2016-09',
        endDate: '2020-05',
        description: 'Major in Software Engineering'
      }],
      experience: [{
        title: 'Senior Software Developer',
        company: 'Tech Solutions Inc.',
        location: 'New York, NY',
        startDate: '2020-06',
        endDate: 'Present',
        description: 'Lead developer for enterprise web applications'
      }],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
      projects: [{
        name: 'E-commerce Platform',
        description: 'Developed a full-stack e-commerce solution',
        technologies: ['React', 'Node.js', 'MongoDB'],
        link: 'https://example.com/project'
      }]
    };

    // Create a style tag with the template's CSS
    const styleTag = `<style>${template.css}</style>`;

    // Render the template with sample resume data
    const renderedTemplate = await require('ejs').render(template.html, { 
      resume: sampleResume,
      formatDate: (date) => date === 'Present' ? 'Present' : new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });

    // Return the complete HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Template Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          ${styleTag}
          <style>
            body {
              padding: 2rem;
              background: #f8f9fa;
            }
            .preview-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${renderedTemplate}
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Preview template error:', error);
    res.status(500).json({ error: 'Error previewing template: ' + error.message });
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

// Get analytics dashboard
exports.getAnalytics = async (req, res) => {
    try {
        // Get basic stats
        const totalUsers = await User.countDocuments();
        const totalResumes = await Resume.countDocuments();
        const activeTemplates = await Template.countDocuments({ isActive: true });
        
        // Calculate conversion rate (users who created resumes / total users)
        const usersWithResumes = await User.countDocuments({ 'resumes.0': { $exists: true } });
        const conversionRate = totalUsers > 0 ? ((usersWithResumes / totalUsers) * 100).toFixed(1) : 0;
        
        // Get user growth data (last 7 days)
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt" 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        // Get template growth data (last 7 days)
        const templateGrowth = await Template.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt" 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        // Get resume growth data (last 7 days)
        const resumeGrowth = await Resume.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                }
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$createdAt" 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        // Get resume distribution by template
        const resumeDistribution = await Resume.aggregate([
            {
                $group: {
                    _id: "$template",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "templates",
                    localField: "_id",
                    foreignField: "_id",
                    as: "templateInfo"
                }
            },
            {
                $unwind: "$templateInfo"
            },
            {
                $project: {
                    name: "$templateInfo.name",
                    count: 1
                }
            }
        ]);
        
        // Format data for charts
        const stats = {
            totalUsers,
            totalResumes,
            activeTemplates,
            conversionRate,
            userGrowth: {
                labels: userGrowth.map(item => item._id),
                data: userGrowth.map(item => item.count)
            },
            templateGrowth: {
                labels: templateGrowth.map(item => item._id),
                data: templateGrowth.map(item => item.count)
            },
            resumeGrowth: {
                labels: resumeGrowth.map(item => item._id),
                data: resumeGrowth.map(item => item.count)
            },
            resumeDistribution: {
                labels: resumeDistribution.map(item => item.name),
                data: resumeDistribution.map(item => item.count)
            }
        };
        
        res.render('admin/analytics', {
            stats,
            title: 'Analytics Dashboard'
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        req.flash('error', 'Failed to load analytics data');
        res.redirect('/admin');
    }
};

// Use template to create new resume
exports.useTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        
        // Validate template exists
        const template = await Template.findById(templateId);
        if (!template) {
            req.flash('error', 'Template not found');
            return res.redirect('/admin/templates');
        }

        // Create a new resume with the selected template
        const resume = new Resume({
            user: req.user._id,
            template: templateId,
            title: 'New Resume',
            personalInfo: {
                fullName: req.user.name || '',
                email: req.user.email || '',
                phone: '',
                location: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            projects: [],
            completionStatus: 0
        });

        await resume.save();

        // Increment template usage count
        await template.incrementUsage();

        req.flash('success', 'New resume created with selected template');
        res.redirect(`/resume/edit/${resume._id}`);
    } catch (error) {
        console.error('Use template error:', error);
        req.flash('error', 'Error creating resume with template');
        res.redirect('/admin/templates');
    }
}; 