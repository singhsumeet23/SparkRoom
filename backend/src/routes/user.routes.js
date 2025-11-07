const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect } = require('../middleware/auth.middleware');

// GET /api/users/search?q=...
// Search for users by email or name (excluding the searcher)
router.get('/search', protect, async (req, res) => {
  const searchQuery = req.query.q;
  const currentUserId = req.user._id;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Find users whose name OR email match the query,
    // and are NOT the user who is searching.
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // $ne means "not equal"
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive name
            { email: { $regex: searchQuery, $options: 'i' } } // Case-insensitive email
          ]
        }
      ]
    }).select('name email _id'); // Only send back necessary info

    res.json(users);

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

module.exports = router;