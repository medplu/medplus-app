const mongoose = require('mongoose');
const Subaccount = require('../models/sub_account.model');

exports.getSubaccountByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Convert userId to ObjectId directly
    const objectId = mongoose.Types.ObjectId(userId);

    const subaccount = await Subaccount.findOne({ user: objectId });
    if (!subaccount) {
      return res.status(404).json({ status: 'Failed', message: 'Subaccount not found' });
    }
    res.status(200).json({ status: 'Success', data: subaccount });
  } catch (error) {
    console.error('Error fetching subaccount:', error);
    res.status(500).json({ status: 'Failed', message: 'Internal server error' });
  }
};
