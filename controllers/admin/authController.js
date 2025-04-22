const passport = require('passport');
const User = require('../../dataBase/models/User');
const bcrypt = require('bcryptjs');

// Get admin login page
exports.getLogin = (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        title: 'Admin Login',
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
};

// Handle admin login
exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and is an admin
        if (!user || user.role !== 'admin') {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/admin/login');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/admin/login');
        }

        // Log in the user
        req.login(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                req.flash('error', 'An error occurred during login');
                return res.redirect('/admin/login');
            }
            res.redirect('/admin/dashboard');
        });
    } catch (error) {
        console.error('Admin login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/admin/login');
    }
};

// Handle admin logout
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        req.flash('success', 'Successfully logged out');
        res.redirect('/admin/login');
    });
};

module.exports = exports; 