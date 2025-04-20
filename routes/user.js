const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resumeController = require('../controllers/resumeController');
const Resume = require('../models/resume');

// Auth routes
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'Register',
    messages: req.flash()
  });
});

router.post('/register', authController.register);

router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    messages: req.flash()
  });
});

router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Resume routes (protected)
router.get('/dashboard', authController.isAuthenticated, async (req, res) => {
  try {
    // Get user's resumes
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    
    res.render('dashboard', { 
      title: 'Dashboard',
      user: req.user,
      resumes: resumes || [],
      messages: req.flash()
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

router.get('/templates', authController.isAuthenticated, async (req, res) => {
  try {
    // Get templates data
    const templates = [
      {
        id: 'template1',
        name: 'Professional Classic',
        thumbnail: '/images/templates/template1.png',
        description: 'A clean and professional template suitable for all industries'
      },
      {
        id: 'template2',
        name: 'Modern Minimal',
        thumbnail: '/images/templates/template2.png',
        description: 'A modern and minimal design for creative professionals'
      },
      {
        id: 'template3',
        name: 'Executive Style',
        thumbnail: '/images/templates/template3.png',
        description: 'An executive-style template for senior professionals'
      }
    ];
    
    // Render the templates view with the data
    res.render('templates', { 
      title: 'Templates',
      templates, 
      user: req.user,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Templates error:', error);
    req.flash('error', 'Error loading templates');
    res.redirect('/dashboard');
  }
});

router.post('/resume/update', authController.isAuthenticated, resumeController.updateResumeData);
router.post('/resume/template', authController.isAuthenticated, resumeController.selectTemplate);
router.get('/resume/download', authController.isAuthenticated, resumeController.generatePDF);

// Resume builder steps
router.get('/resume/personal-info', authController.isAuthenticated, (req, res) => {
  res.render('resume/personal-info', { 
    title: 'Personal Information',
    user: req.user 
  });
});

router.get('/resume/education', authController.isAuthenticated, (req, res) => {
  res.render('resume/education', { 
    title: 'Education',
    user: req.user 
  });
});

router.get('/resume/experience', authController.isAuthenticated, (req, res) => {
  res.render('resume/experience', { 
    title: 'Experience',
    user: req.user 
  });
});

router.get('/resume/skills', authController.isAuthenticated, (req, res) => {
  res.render('resume/skills', { 
    title: 'Skills',
    user: req.user 
  });
});

router.get('/resume/projects', authController.isAuthenticated, (req, res) => {
  res.render('resume/projects', { 
    title: 'Projects',
    user: req.user 
  });
});

// Home route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home',
    user: req.user 
  });
});

router.get('/resume/new', authController.isAuthenticated, async (req, res) => {
  try {
    const template = req.query.template || 'template1';
    
    // Create a new resume with the selected template
    const newResume = new Resume({
      user: req.user._id,
      title: 'My Resume',
      template: template,
      completionStatus: 0
    });
    
    await newResume.save();
    
    // Redirect to the first step of resume building
    res.redirect(`/resume/edit/${newResume._id}`);
  } catch (error) {
    console.error('Create resume error:', error);
    req.flash('error', 'Error creating new resume');
    res.redirect('/dashboard');
  }
});

// Add a route for editing a resume
router.get('/resume/edit/:id', authController.isAuthenticated, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      req.flash('error', 'Resume not found');
      return res.redirect('/dashboard');
    }
    
    // Check if the resume belongs to the current user
    if (resume.user.toString() !== req.user._id.toString()) {
      req.flash('error', 'You do not have permission to edit this resume');
      return res.redirect('/dashboard');
    }
    
    res.render('resume/edit', {
      title: 'Edit Resume',
      resume: resume,
      user: req.user,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Edit resume error:', error);
    req.flash('error', 'Error loading resume');
    res.redirect('/dashboard');
  }
});

// Update resume
router.post('/resume/update/:id', authController.isAuthenticated, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Update resume fields
    resume.personalInfo = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location
    };
    resume.summary = req.body.summary;
    resume.education = req.body.education || [];
    resume.experience = req.body.experience || [];
    resume.skills = req.body.skills || [];
    resume.projects = req.body.projects || [];

    // Calculate completion status
    let completedFields = 0;
    let totalFields = 0;

    // Personal Info (4 fields)
    totalFields += 4;
    if (resume.personalInfo.fullName) completedFields++;
    if (resume.personalInfo.email) completedFields++;
    if (resume.personalInfo.phone) completedFields++;
    if (resume.personalInfo.location) completedFields++;

    // Summary (1 field)
    totalFields++;
    if (resume.summary) completedFields++;

    // Education (at least 1 entry with 4 required fields)
    if (resume.education.length > 0) {
      totalFields += 4;
      const hasRequiredFields = resume.education.some(edu => 
        edu.school && edu.degree && edu.startDate && edu.endDate
      );
      if (hasRequiredFields) completedFields += 4;
    }

    // Experience (at least 1 entry with 4 required fields)
    if (resume.experience.length > 0) {
      totalFields += 4;
      const hasRequiredFields = resume.experience.some(exp => 
        exp.company && exp.position && exp.startDate && exp.endDate
      );
      if (hasRequiredFields) completedFields += 4;
    }

    // Skills (at least 1 skill)
    totalFields++;
    if (resume.skills.length > 0) completedFields++;

    // Projects (at least 1 project with name)
    if (resume.projects.length > 0) {
      totalFields++;
      const hasRequiredFields = resume.projects.some(proj => proj.name);
      if (hasRequiredFields) completedFields++;
    }

    resume.completionStatus = Math.round((completedFields / totalFields) * 100);
    await resume.save();

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ success: false, error: 'Error updating resume' });
  }
});

// Preview resume
router.get('/resume/preview/:id', authController.isAuthenticated, resumeController.previewResume);

// Download PDF
router.get('/resume/download/:id', authController.isAuthenticated, resumeController.downloadPDF);

// Delete resume
router.delete('/resume/delete/:id', authController.isAuthenticated, resumeController.deleteResume);

module.exports = router;
