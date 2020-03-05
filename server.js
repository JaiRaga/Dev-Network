const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Connect to DB
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 9008;

app.listen(PORT, () => console.log(`Server is up on ${PORT}`));
