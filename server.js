const express = require('express');
const path = require('path');
const userRoute = require("./routes/user")
const adminRoute= require("./routes/admin")
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));



// app.use("/admin", adminRoute);
app.use("/", userRoute);

console.log("User routes loaded");




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
