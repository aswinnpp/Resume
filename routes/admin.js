const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const settingsController = require('../controllers/admin/settingsController');
const { isAdmin, ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const authController = require('../controllers/admin/authController');
const User = require('../dataBase/models/User');
const Resume = require('../dataBase/models/Resume');
const Template = require('../dataBase/models/Template');

// Apply admin middleware to all routes
router.use(isAdmin);

// Admin authentication routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Protected admin routes (add more as needed)
router.get('/', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        // Get statistics
        const stats = {
            totalUsers: await User.countDocuments(),
            totalResumes: await Resume.countDocuments(),
            totalTemplates: await Template.countDocuments(),
            recentUsers: await User.find().sort({ createdAt: -1 }).limit(5)
        };

        res.render('admin/dashboard', {
            user: req.user,
            stats: stats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('admin/dashboard', {
            user: req.user,
            stats: {
                totalUsers: 0,
                totalResumes: 0,
                totalTemplates: 0,
                recentUsers: []
            }
        });
    }
});

// Dashboard
router.get('/', adminController.getDashboard);

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
