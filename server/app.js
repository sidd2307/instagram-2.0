const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 5000;

// keys file
const { MONGOURI } = require("./keys");

// database connection
mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully!");
});

mongoose.connection.on("error", (err) => {
  console.log("Error: ", err);
});

// models
require("./models/User");
require("./models/Post");

// middleware for json data
app.use(express.json());

// routes
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
