const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const env = require("dotenv").config();
const session = require("express-session");
const connectDB = require("./dataBase/connectDB");
const passport = require("passport");
const flash = require("connect-flash");
const rateLimit = require('express-rate-limit');

const adminRoute = require("./routes/admin");
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Make user available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.messages = req.flash();
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // max 10 requests per window per IP
  message: {
    status: 429,
    error: "Too many login attempts. Please try again after 15 minutes."
  }
});

app.use('/auth', authLimiter);

// Connect to database
connectDB();

// Routes
app.use("/", userRoute);

console.log("User routes loaded");

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
