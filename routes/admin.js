const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/admin/settingsController');
const { isAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
// router.use(isAdmin);

// Dashboard
router.get('/', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

// Template management
router.get('/templates', adminController.getTemplates);
router.get('/templates/add', adminController.getAddTemplate);
router.get('/templates/edit/:id', adminController.getEditTemplate);
router.post('/templates', adminController.createTemplate);
router.put('/templates/:id', adminController.updateTemplate);
router.delete('/templates/:id', adminController.deleteTemplate);

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
