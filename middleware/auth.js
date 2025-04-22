const User = require('../dataBase/models/User');
const Resume = require('../dataBase/models/Resume');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/login');
};

// Middleware to check if user is NOT authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    // Redirect to appropriate dashboard based on role
    if (req.user.role === 'admin') {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/dashboard');
    }
};

// Middleware to check if user has completed profile
const hasCompletedProfile = (req, res, next) => {
    if (req.user && req.user.hasCompletedProfile) {
        return next();
    }
    req.flash('info', 'Please complete your profile first');
    res.redirect('/profile/setup');
};

// Middleware to check if user owns the resume
const isResumeOwner = async (req, res, next) => {
    try {
        const resumeId = req.params.id;
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            req.flash('error', 'Resume not found');
            return res.redirect('/dashboard');
        }

        if (resume.user.toString() !== req.user._id.toString()) {
            req.flash('error', 'You do not have permission to access this resume');
            return res.redirect('/dashboard');
        }

        req.resume = resume; // Attach resume to request for later use
        next();
    } catch (error) {
        console.error('Resume ownership check error:', error);
        req.flash('error', 'Error checking resume ownership');
        res.redirect('/dashboard');
    }
};

// Role-based access control middleware
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Please log in to access this page');
            return res.redirect('/login');
        }

        if (!roles.includes(req.user.role)) {
            req.flash('error', 'You do not have permission to access this page');
            return res.redirect('/dashboard');
        }

        next();
    };
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isNotAuthenticated,
    hasCompletedProfile,
    isResumeOwner,
    checkRole
}; 