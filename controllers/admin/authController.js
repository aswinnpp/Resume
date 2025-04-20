const passport = require('passport');
const User = require('../../dataBase/models/User');
const bcrypt = require('bcryptjs');

// Get admin login page
exports.getLogin = (req, res) => {
    res.render('admin/login', {
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
console.log("admin@resumebuilder.com",email,password);

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and is an admin
        if (!user || !user.isAdmin) {

            console.log("ddd");
            
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
            res.redirect('/admin');
        });
    } catch (error) {
        console.error('Admin login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/admin/login');
    }
};

// Handle admin logout
exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out');
    res.redirect('/admin/login');
}; 