const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config()
// MongoDB connection string
const mongoURI = process.env.MONGODB_URI;



mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));
// Mongoose models for Groups and Members
const groupSchema = new mongoose.Schema({
  index: String,
  sum: Number,
  members: [{
    name: String,
    people: Number,
    isChecked: { type: Boolean, default: false }
  }]
}, { collection: 'saveddatas' }); // Explicitly setting the collection name

const Group = mongoose.model('Group', groupSchema);


const savedDataSchema = new mongoose.Schema({
  groups: [groupSchema],  // Embed the group schema as an array
  total_sum: Number
});
const SavedData = mongoose.model('SavedData', savedDataSchema);
const app = express();
const port = 8080;


app.use(bodyParser.json());
app.use(cors());



// Get all groups and their members


// Route to fetch saved data
app.get('/api/saveddatas', async (req, res) => {
  try {
    const groups = await SavedData.find();  // Find all groups in the collection
   
    res.json(groups);  // Return the groups as a JSON response
  } catch (err) {
    res.status(500).send(err);  // Handle any errors
  }
});
// Add new member to a group
// Route to add a new member to a group
app.post('/api/groups/:groupIndex/member', async (req, res) => {
  const { groupIndex } = req.params;
  const { name, people } = req.body;

  // Validate input data
  if (!name || typeof name !== 'string' || !people || typeof people !== 'number') {
    return res.status(400).send({ message: 'Invalid data. "name" must be a string and "people" must be a number.' });
  }

  try {
    // Find the main SavedData document (assuming only one exists)
    const savedData = await SavedData.findOne();
    if (!savedData) {
      return res.status(404).send({ message: 'SavedData not found' });
    }

    // Find the group by index inside savedData.groups
    const group = savedData.groups.find(group => group.index === groupIndex);
    if (!group) {
      return res.status(404).send({ message: 'Group not found' });
    }

    // Add new member
    const newMember = {
      name,
      people,
      isChecked: false
    };
    group.members.push(newMember);
    group.sum += people;

    // Update total_sum if needed
    savedData.total_sum += people;

    await savedData.save();

    // Respond with the new member so frontend can update state
    res.status(200).json(newMember);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).send({ message: 'Error adding member', error: err });
  }
});



// Update the checkbox status of a member
app.put('/api/groups/:groupId/member/:memberId', async (req, res) => {
  const { groupId, memberId } = req.params;
  console.log(`groupId: ${groupId}, memberId: ${memberId}`);

  try {
    // Find the document that contains the groups array
    const savedData = await SavedData.findOne();  // Assuming this is your collection
    if (!savedData) {
      return res.status(404).send('SavedData not found');
    }

    // Find the group by groupId
    const group = savedData.groups.find(group => group._id.toString() === groupId);
    if (!group) {
      return res.status(404).send('Group not found');
    }

    // Find the member by memberId in the group
    const member = group.members.find(member => member._id.toString() === memberId);
    if (!member) {
      return res.status(404).send('Member not found');
    }

    // Toggle the isChecked value
    member.isChecked = !member.isChecked;
    await savedData.save();  // Save the changes to the database

    res.status(200).json(member);  // Return the updated member data
  } catch (err) {
    res.status(500).send(err);
  }
});





// Delete a member from a group inside SavedData
app.delete('/api/groups/:groupId/member/:memberId', async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    const savedData = await SavedData.findOne();
    if (!savedData) return res.status(404).send({ message: 'SavedData not found' });

    const group = savedData.groups.find(group => group._id.toString() === groupId);
    if (!group) return res.status(404).send({ message: 'Group not found' });

    const memberIndex = group.members.findIndex(member => member._id.toString() === memberId);
    if (memberIndex === -1) return res.status(404).send({ message: 'Member not found' });

    const removedMember = group.members.splice(memberIndex, 1)[0];
    group.sum -= removedMember.people;
    savedData.total_sum -= removedMember.people;

    await savedData.save();

    res.status(200).json({ message: 'Member deleted successfully', member: removedMember });
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).send({ message: 'Error deleting member', error: err });
  }
});






app.post('/api/saveData', async (req, res) => {
  const { groups, total_sum } = req.body;

  try {
    // Create a new SavedData document that stores the entire data
    const savedData = new SavedData({
      groups,
      total_sum
    });

    await savedData.save();

    // Respond with success
    res.status(201).json({ message: 'Data saved successfully!', data: savedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving data' });
  }
});


app.post('/api/groups/:groupIndex/member', async (req, res) => {
  const { groupIndex } = req.params;
  const { name, people } = req.body;

  try {
    const group = await Group.findOne({ index: groupIndex });

    if (group) {
      group.members.push({ name, people });
      group.sum += people;
      await group.save();
      res.status(200).json(group);
    } else {
      res.status(404).send('Group not found');
    }
  } catch (err) {
    res.status(500).send(err);
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
