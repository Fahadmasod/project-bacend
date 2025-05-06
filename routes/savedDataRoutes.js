const express = require('express');
const router = express.Router();
const SavedData = require('../models/SavedData');

// GET all saved data
router.get('/saveddatas', async (req, res) => {
    const start = Date.now();
    try {
      const groups = await SavedData.find().lean();
      console.log("Fetch time:", Date.now() - start, "ms");
      res.json(groups);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  

// POST new data
router.post('/saveData', async (req, res) => {
  const { groups, total_sum } = req.body;
  try {
    const savedData = new SavedData({ groups, total_sum });
    await savedData.save();
    res.status(201).json({ message: 'Data saved successfully!', data: savedData });
  } catch (error) {
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
    const savedData = await SavedData.findOne();
    if (!savedData) return res.status(404).send({ message: 'SavedData not found' });

    const group = savedData.groups.find(g => g.index === groupIndex);
    if (!group) return res.status(404).send({ message: 'Group not found' });

    const newMember = { name, people, isChecked: false };
    group.members.push(newMember);
    group.sum += people;
    savedData.total_sum += people;

    await savedData.save();
    res.status(200).json(newMember);
  } catch (err) {
    res.status(500).send({ message: 'Error adding member', error: err });
  }
});

// Update isChecked status
router.put('/groups/:groupId/member/:memberId', async (req, res) => {
  try {
    const savedData = await SavedData.findOne();
    if (!savedData) return res.status(404).send('SavedData not found');

    const group = savedData.groups.id(req.params.groupId);
    if (!group) return res.status(404).send('Group not found');

    const member = group.members.id(req.params.memberId);
    if (!member) return res.status(404).send('Member not found');

    member.isChecked = !member.isChecked;
    await savedData.save();

    res.status(200).json(member);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Edit member details
router.put('/groups/:groupId/member/:memberId/edit', async (req, res) => {
  const { name, people } = req.body;
  if (!name || typeof name !== 'string' || !people || typeof people !== 'number') {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const savedData = await SavedData.findOne();
    if (!savedData) return res.status(404).json({ message: 'Saved data not found' });

    const group = savedData.groups.id(req.params.groupId);
    const member = group?.members.id(req.params.memberId);
    if (!group || !member) return res.status(404).json({ message: 'Group or member not found' });

    group.sum = group.sum - member.people + people;
    member.name = name;
    member.people = people;

    await savedData.save();
    res.json({ message: 'Member updated successfully', member });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating member', error: err });
  }
});

// Delete member
router.delete('/groups/:groupId/member/:memberId', async (req, res) => {
  try {
    const savedData = await SavedData.findOne();
    const group = savedData?.groups.id(req.params.groupId);
    const memberIndex = group?.members.findIndex(m => m._id.toString() === req.params.memberId);

    if (!savedData || !group || memberIndex === -1) {
      return res.status(404).send({ message: 'Group or Member not found' });
    }

    const removedMember = group.members.splice(memberIndex, 1)[0];
    group.sum -= removedMember.people;
    savedData.total_sum -= removedMember.people;

    await savedData.save();
    res.json({ message: 'Member deleted successfully', member: removedMember });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting member', error: err });
  }
});

module.exports = router;
