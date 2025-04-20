const User = require('../dataBase/models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Passport Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = {
    // Register new user
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                req.flash('error', 'Email already registered');
                return res.redirect('/register');
            }
            
            // Create new user
            const user = new User({
                name,
                email,
                password
            });
            
            await user.save();
            
            req.flash('success', 'Registration successful! Please login.');
            res.redirect('/login');
        } catch (error) {
            console.error('Registration error:', error);
            req.flash('error', 'Registration failed. Please try again.');
            res.redirect('/register');
        }
    },

    // Login user
    login: passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }),

    // Logout user
    logout: (req, res, next) => {
        req.logout(function(err) {
            if (err) {
                return next(err);
            }
            req.flash('success', 'You are logged out');
            res.redirect('/');
        });
    },

    // Check if user is authenticated
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated && req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Please login to access this page');
        res.redirect('/login');
    },

    // Display login page
    getLogin: (req, res) => {
        res.render('admin/login', {
            title: 'Admin Login',
            messages: req.flash()
        });
    },

    // Handle login POST
    postLogin: (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/admin',
            failureRedirect: '/admin/login',
            failureFlash: true
        })(req, res, next);
    },

    // Get admin dashboard
    getDashboard: (req, res) => {
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            user: req.user,
            messages: req.flash()
        });
    }
}; 