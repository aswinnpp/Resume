const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resumeController = require('../controllers/resumeController');

// Auth routes
router.get('/register', (req, res) => res.render('auth/register'));
router.post('/register', authController.register);
router.get('/login', (req, res) => res.render('auth/login'));
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Resume routes (protected)
router.get('/dashboard', authController.isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

router.get('/templates', authController.isAuthenticated, async (req, res) => {
  const templates = await resumeController.getTemplates(req, res);
  res.render('templates', { templates, user: req.user });
});

router.post('/resume/update', authController.isAuthenticated, resumeController.updateResumeData);
router.post('/resume/template', authController.isAuthenticated, resumeController.selectTemplate);
router.get('/resume/download', authController.isAuthenticated, resumeController.generatePDF);

// Resume builder steps
router.get('/resume/personal-info', authController.isAuthenticated, (req, res) => {
  res.render('resume/personal-info', { user: req.user });
});

router.get('/resume/education', authController.isAuthenticated, (req, res) => {
  res.render('resume/education', { user: req.user });
});

router.get('/resume/experience', authController.isAuthenticated, (req, res) => {
  res.render('resume/experience', { user: req.user });
});

router.get('/resume/skills', authController.isAuthenticated, (req, res) => {
  res.render('resume/skills', { user: req.user });
});

router.get('/resume/projects', authController.isAuthenticated, (req, res) => {
  res.render('resume/projects', { user: req.user });
});

// Home route
router.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

module.exports = router;
