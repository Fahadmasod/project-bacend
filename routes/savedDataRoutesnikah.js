const express = require('express');
const router = express.Router();
const { SavedData1 } = require('../models/SavedData');

// Get all SavedData1 documents
router.get('/SavedData1', async (req, res) => {
  try {
    const data = await SavedData1.find();
    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message });
  }
});

// Save new data
router.post('/saveData', async (req, res) => {
  const { groups, total_sum } = req.body;
  try {
    const savedDataInstance = new SavedData1({ groups, total_sum });
    await savedDataInstance.save();
    res.status(201).json({ message: 'Data saved successfully!', data: savedDataInstance });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: 'Error saving data', error });
  }
});

// Add member to group by groupIndex
router.post('/groups/:groupIndex/member', async (req, res) => {
  const { groupIndex } = req.params;
  const { name, people } = req.body;

  if (!name || typeof name !== 'string' || !people || typeof people !== 'number') {
    return res.status(400).send({ message: 'Invalid data' });
  }

  try {
    const savedDataDoc = await SavedData1.findOne();
    if (!savedDataDoc) return res.status(404).send({ message: 'SavedData1 not found' });

    const group = savedDataDoc.groups.find(g => g.index === groupIndex);
    if (!group) return res.status(404).send({ message: 'Group not found' });

    const newMember = { name, people, isChecked: false };
    group.members.push(newMember);
    group.sum += people;
    savedDataDoc.total_sum += people;

    await savedDataDoc.save();
    res.status(200).json(newMember);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).send({ message: 'Error adding member', error: err.message });
  }
});

// Toggle isChecked status
router.put('/groups/:groupId/member/:memberId', async (req, res) => {
  try {
    const savedDataDoc = await SavedData1.findOne();
    if (!savedDataDoc) return res.status(404).send('SavedData1 not found');

    const group = savedDataDoc.groups.id(req.params.groupId);
    if (!group) return res.status(404).send('Group not found');

    const member = group.members.id(req.params.memberId);
    if (!member) return res.status(404).send('Member not found');

    member.isChecked = !member.isChecked;
    await savedDataDoc.save();

    res.status(200).json(member);
  } catch (err) {
    console.error("Toggle isChecked error:", err);
    res.status(500).send(err.message || err);
  }
});

// Edit member details
router.put('/groups/:groupId/member/:memberId/edit', async (req, res) => {
  const { name, people } = req.body;

  if (!name || typeof name !== 'string' || !people || typeof people !== 'number') {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const savedDataDoc = await SavedData1.findOne();
    if (!savedDataDoc) return res.status(404).json({ message: 'Saved data not found' });

    const group = savedDataDoc.groups.id(req.params.groupId);
    const member = group?.members.id(req.params.memberId);
    if (!group || !member) return res.status(404).json({ message: 'Group or member not found' });

    group.sum = group.sum - member.people + people;
    member.name = name;
    member.people = people;

    await savedDataDoc.save();
    res.json({ message: 'Member updated successfully', member });
  } catch (err) {
    console.error("Error editing member:", err);
    res.status(500).json({ message: 'Server error while updating member', error: err.message });
  }
});

// Delete member
router.delete('/groups/:groupId/member/:memberId', async (req, res) => {
  try {
    const savedDataDoc = await SavedData1.findOne();
    if (!savedDataDoc) return res.status(404).send({ message: 'No saved data found' });

    const group = savedDataDoc.groups.id(req.params.groupId);
    if (!group) return res.status(404).send({ message: 'Group not found' });

    const memberIndex = group.members.findIndex(
      m => m._id.toString() === req.params.memberId
    );
    if (memberIndex === -1) return res.status(404).send({ message: 'Member not found' });

    const removedMember = group.members.splice(memberIndex, 1)[0];
    group.sum -= removedMember.people;
    savedDataDoc.total_sum -= removedMember.people;

    await savedDataDoc.save();
    res.json({ message: 'Member deleted successfully', member: removedMember });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: 'Error deleting member', error: err.message });
  }
});

module.exports = router;
