const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get messages for a swap
router.get('/swap/:swapId', authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    
    // Verify user is part of this swap
    const swapCheck = await pool.query(
      'SELECT * FROM swap_requests WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)',
      [swapId, req.user.userId]
    );
    
    if (swapCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.profile_photo_url as sender_photo
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.swap_id = $1
      ORDER BY m.created_at ASC
    `, [swapId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { swap_id, receiver_id, message } = req.body;
    
    // Verify user is part of this swap
    const swapCheck = await pool.query(
      'SELECT * FROM swap_requests WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)',
      [swap_id, req.user.userId]
    );
    
    if (swapCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await pool.query(`
      INSERT INTO messages (swap_id, sender_id, receiver_id, message)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [swap_id, req.user.userId, receiver_id, message]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:swapId', authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE swap_id = $1 AND receiver_id = $2',
      [swapId, req.user.userId]
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;