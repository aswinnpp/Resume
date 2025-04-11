const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const env = require("dotenv").config();
const session = require("express-session");
// const connectDB = require("./dataBase/connectDB");
const adminRoute = require("./routes/admin");
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// connectDB()

// app.use("/admin", adminRoute);
app.use("/", userRoute);

console.log("User routes loaded");

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
