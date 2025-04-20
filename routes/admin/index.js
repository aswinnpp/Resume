const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../middleware/auth');
const settingsRoutes = require('./settings');

// Admin dashboard
router.get('/admin', isAdmin, (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        user: req.user
    });
});

// Include settings routes
router.use('/settings', settingsRoutes);

module.exports = router; 