//#5 create new file - server.js
const express = require("express");

const connectDB = require("../config/db");

const app = express();

//connect db
connectDB; // eslint warning but correct working code as it is

// init Middleware
app.use(express.json({ extended: false })); //allow us to get the data from req.body in each api >resource

//single end-point for initial test
app.get("/", (req, res) => res.send("API running"));

//define routes:
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
