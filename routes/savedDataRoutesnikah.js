const express = require('express');
const router = express.Router();
const  {SavedData11} = require('../models/SavedData');

router.get('/SavedData1', async (req, res) => {
  try {
    const data = await SavedData11.find();
    console.log("data")
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// POST new data
router.post('/saveData', async (req, res) => {
  const { groups, total_sum } = req.body;
  try {
    const SavedData1 = new SavedData11({ groups, total_sum });
    await SavedData1.save();
    res.status(201).json({ message: 'Data saved successfully!', data: SavedData1 });
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
    const SavedData1 = await SavedData11.findOne();
    if (!SavedData1) return res.status(404).send({ message: 'SavedData1 not found' });

    const group = SavedData1.groups.find(g => g.index === groupIndex);
    if (!group) return res.status(404).send({ message: 'Group not found' });

    const newMember = { name, people, isChecked: false };
    group.members.push(newMember);
    group.sum += people;
    SavedData1.total_sum += people;

    await SavedData1.save();
    res.status(200).json(newMember);
  } catch (err) {
    res.status(500).send({ message: 'Error adding member', error: err });
  }
});

// Update isChecked status
router.put('/groups/:groupId/member/:memberId', async (req, res) => {
  try {
    const SavedData1 = await SavedData11.findOne();
    if (!SavedData1) return res.status(404).send('SavedData1 not found');

    const group = SavedData1.groups.id(req.params.groupId);
    if (!group) return res.status(404).send('Group not found');

    const member = group.members.id(req.params.memberId);
    if (!member) return res.status(404).send('Member not found');

    member.isChecked = !member.isChecked;
    await SavedData1.save();

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
    const SavedData11 = await SavedData11.findOne();
    if (!SavedData11) return res.status(404).json({ message: 'Saved data not found' });

    const group = SavedData11.groups.id(req.params.groupId);
    const member = group?.members.id(req.params.memberId);
    if (!group || !member) return res.status(404).json({ message: 'Group or member not found' });

    group.sum = group.sum - member.people + people;
    member.name = name;
    member.people = people;

    await SavedData11.save();
    res.json({ message: 'Member updated successfully', member });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating member', error: err });
  }
});

// Delete member
router.delete('/groups/:groupId/member/:memberId', async (req, res) => {
  try {
    const SavedData1 = await SavedData11.findOne();
    const group = SavedData1?.groups.id(req.params.groupId);
    const memberIndex = group?.members.findIndex(m => m._id.toString() === req.params.memberId);

    if (!SavedData1 || !group || memberIndex === -1) {
      return res.status(404).send({ message: 'Group or Member not found' });
    }

    const removedMember = group.members.splice(memberIndex, 1)[0];
    group.sum -= removedMember.people;
    SavedData1.total_sum -= removedMember.people;

    await SavedData1.save();
    res.json({ message: 'Member deleted successfully', member: removedMember });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting member', error: err });
  }
});


module.exports = router;
