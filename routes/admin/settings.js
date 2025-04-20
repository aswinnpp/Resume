const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middleware/auth');
const settingsController = require('../../controllers/admin/settingsController');

// Get settings page
router.get('/', isAdmin, settingsController.getSettings);

// Update general settings
router.post('/general', isAdmin, settingsController.updateGeneralSettings);

// Update email settings
router.post('/email', isAdmin, settingsController.updateEmailSettings);

// Test email settings
router.post('/email/test', isAdmin, settingsController.testEmailSettings);

// Update security settings
router.post('/security', isAdmin, settingsController.updateSecuritySettings);

// Update maintenance settings
router.post('/maintenance', isAdmin, settingsController.updateMaintenanceSettings);

// Create backup
router.post('/backup', isAdmin, settingsController.createBackup);

module.exports = router; 