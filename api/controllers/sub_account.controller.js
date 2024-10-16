const Subaccount = require('../models/sub_account.model');

// Fetch subaccount info by user ID
exports.getSubaccountByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const subaccount = await Subaccount.findOne({ user: userId });

    if (!subaccount) {
      return res.status(404).json({ message: 'Subaccount not found' });
    }

    res.json(subaccount);
  } catch (error) {
    console.error('Error fetching subaccount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};