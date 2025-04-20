const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resumeController = require('../controllers/resumeController');
const Resume = require('../dataBase/models/Resume');
const Template = require('../dataBase/models/Template');
const mongoose = require('mongoose');

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
    const templates = await Template.find().select('name description thumbnail');
    res.render('templates', {
      title: 'Select Template',
      templates,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Templates error:', error);
    req.flash('error', 'Error loading templates');
    res.redirect('/dashboard');
  }
});

// Resume routes
router.get('/resume/new', authController.isAuthenticated, resumeController.createNewResume);
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
router.get('/resume/preview/:id', authController.isAuthenticated, resumeController.previewResume);
router.get('/resume/download/:id', authController.isAuthenticated, resumeController.downloadPDF);
router.post('/resume/update/:id', authController.isAuthenticated, resumeController.updateResumeData);
router.post('/resume/delete/:id', authController.isAuthenticated, resumeController.deleteResume);

// Home route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Home',
    user: req.user 
  });
});

module.exports = router;
