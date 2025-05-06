const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config();

const savedDataRoutes = require('./routes/savedDataRoutes');

const app = express();
const port = process.env.PORT || 8080;
const mongoURI = process.env.MONGODB_URI;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Routes
app.use('/api', savedDataRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
