/**
 * Users Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// GET /api/users/leaderboard (public)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'user', isActive: true })
      .select('name credits totalRecycled totalItemsWeight')
      .sort({ credits: -1 })
      .limit(20);
    res.json({ leaderboard: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
