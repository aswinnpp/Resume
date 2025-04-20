const User = require('../dataBase/models/User');

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/admin/login');
};

const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash('error', 'You do not have permission to access this page');
    res.redirect('/admin/login');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return res.redirect('/admin');
    }
    next();
};

module.exports = {
    ensureAuthenticated,
    ensureAdmin,
    isAdmin
}; 