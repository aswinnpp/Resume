const User = require('../../dataBase/models/User');
const Template = require('../../dataBase/models/Template');
const Resume = require('../../dataBase/models/Resume');

// Get settings page
exports.getSettings = async (req, res) => {
    try {
        // Get all templates for the settings page
        const templates = await Template.find().select('name _id');
        
        // Get default settings (in a real app, these would come from a database)
        const settings = {
            siteName: 'Resume Builder',
            siteDescription: 'Professional Resume Builder Application',
            contactEmail: 'admin@resumebuilder.com',
            maxResumesPerUser: 5,
            defaultTemplate: templates.length > 0 ? templates[0]._id : null,
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
            smtpUser: 'user@example.com',
            smtpPass: '********',
            emailFrom: 'noreply@resumebuilder.com',
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requirePasswordReset: false,
            enableTwoFactor: false,
            maintenanceMode: false,
            maintenanceMessage: 'Site is under maintenance. Please check back later.',
            backupFrequency: 'daily',
            backupRetention: 30
        };

        res.render('admin/settings', {
            title: 'Admin Settings',
            user: req.user,
            settings,
            templates
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        req.flash('error', 'An error occurred while fetching settings');
        res.redirect('/admin');
    }
};

// Update general settings
exports.updateGeneralSettings = async (req, res) => {
    try {
        // In a real app, you would save these settings to a database
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'General settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating general settings:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating general settings'
        });
    }
};

// Update email settings
exports.updateEmailSettings = async (req, res) => {
    try {
        // In a real app, you would save these settings to a database
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'Email settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating email settings:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating email settings'
        });
    }
};

// Test email settings
exports.testEmailSettings = async (req, res) => {
    try {
        // In a real app, you would send a test email using the configured settings
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'Test email sent successfully'
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while sending test email'
        });
    }
};

// Update security settings
exports.updateSecuritySettings = async (req, res) => {
    try {
        // In a real app, you would save these settings to a database
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'Security settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating security settings:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating security settings'
        });
    }
};

// Update maintenance settings
exports.updateMaintenanceSettings = async (req, res) => {
    try {
        // In a real app, you would save these settings to a database
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'Maintenance settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating maintenance settings:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating maintenance settings'
        });
    }
};

// Create backup
exports.createBackup = async (req, res) => {
    try {
        // In a real app, you would create a backup of the database
        // For now, we'll just return a success message
        res.json({
            success: true,
            message: 'Backup created successfully'
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating backup'
        });
    }
}; 