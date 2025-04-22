const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/admin/settingsController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const authController = require('../controllers/admin/authController');
const User = require('../dataBase/models/User');
const Resume = require('../dataBase/models/Resume');
const Template = require('../dataBase/models/Template');

// Admin authentication routes (no auth required)
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Apply authentication and admin middleware to all routes below this
router.use(isAuthenticated, isAdmin);

// Dashboard
router.get('/', adminController.getDashboard);
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

// Template management
router.get('/templates', adminController.getTemplates);
router.get('/templates/add', adminController.getAddTemplate);
router.get('/templates/edit/:id', adminController.getEditTemplate);
router.get('/templates/:id/preview', adminController.previewTemplate);
router.post('/templates', adminController.createTemplate);
router.put('/templates/:id', adminController.updateTemplate);
router.delete('/templates/:id', adminController.deleteTemplate);
router.post('/templates/:id/use', adminController.useTemplate);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Settings
router.get('/settings', settingsController.getSettings);
router.post('/settings/general', settingsController.updateGeneralSettings);
router.post('/settings/email', settingsController.updateEmailSettings);
router.post('/settings/email/test', settingsController.testEmailSettings);
router.post('/settings/security', settingsController.updateSecuritySettings);
router.post('/settings/maintenance', settingsController.updateMaintenanceSettings);
router.post('/settings/backup', settingsController.createBackup);

module.exports = router;
