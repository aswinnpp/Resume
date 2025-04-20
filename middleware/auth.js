const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/login');
    }

    if (!req.user.isAdmin) {
        req.flash('error', 'You do not have permission to access this page');
        return res.redirect('/dashboard');
    }

    next();
};

module.exports = {
    isAdmin
}; 