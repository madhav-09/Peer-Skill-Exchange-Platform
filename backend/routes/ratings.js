const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get ratings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as rater_name
      FROM ratings r
      JOIN users u ON r.rated_by = u.id AND u.role != 'admin'
      WHERE r.rated_user = $1
      ORDER BY r.created_at DESC
    `, [req.params.userId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add rating
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { swap_id, rated_user, score, comment } = req.body;
    
    // Check if rating already exists
    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE swap_id = $1 AND rated_by = $2',
      [swap_id, req.user.userId]
    );
    
    if (existingRating.rows.length > 0) {
      return res.status(400).json({ error: 'Rating already exists for this swap' });
    }
    
    const result = await pool.query(`
      INSERT INTO ratings (swap_id, rated_by, rated_user, score, comment, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *
    `, [swap_id, req.user.userId, rated_user, score, comment]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings given by a user
router.get('/given/:userId', async (req, res) => {
  try {
    console.log('Getting ratings for user ID:', req.params.userId);
    const result = await pool.query(`
      SELECT r.*, u.name as rated_user_name
      FROM ratings r
      JOIN users u ON r.rated_user = u.id
      WHERE r.rated_by = $1
      ORDER BY r.created_at DESC
    `, [req.params.userId]);
    
    console.log('Found ratings:', result.rows.length);
    console.log('Ratings data:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;