const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./router/Loggoer'); // Import the logger module

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fahadanncode@gmail.com',
    pass: 'dpzcompgbodmtaak'
  }
});

// Temporary array to store user data
const users = [];

// Define the route to handle form submission
app.post('/send-email', (req, res) => {
  console.log(req.body);
  const { name, lastname, email, phone, text } = req.body;
  logger.log('Received a POST request to /send-email');
  logger.log(JSON.stringify(req.body, null, 2));
  const mailOptions = {
    from: 'email',
    to: 'subhanamaroofkhan0123@gmail.com',
    subject: 'About the company',
    text: `
      Name: ${name}
      Lastname: ${lastname}
      Email: ${email}
      Phone: ${phone}
      Text: ${text}
    `
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent:');
      res.send('Email sent');
    }
  });
});

// API to handle login
// API to handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username and password match
    if (username === 'subhanamaroof' && password === 'sub@123') {
      // Add additional logic if login is successful
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.use(express.static(path.join(__dirname, './react-app')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-app', 'index.html'));
});

// Start the server
app.set('port', process.env.PORT || 8081);
const server = app.listen(app.get('port'), async () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
