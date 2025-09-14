const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, location, is_public, is_banned, role, created_at
      FROM users ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Ban/unban user
router.put('/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { is_banned } = req.body;
    const result = await pool.query(
      'UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING id, name, is_banned',
      [is_banned, req.params.id]
    );
    
    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.userId, is_banned ? 'BAN_USER' : 'UNBAN_USER', 'user', req.params.id, `User ${result.rows[0].name}`]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all swaps
router.get('/swaps', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sr.*, 
             sender.name as sender_name, receiver.name as receiver_name
      FROM swap_requests sr
      JOIN users sender ON sr.sender_id = sender.id
      JOIN users receiver ON sr.receiver_id = receiver.id
      ORDER BY sr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Moderate skills
router.put('/skills/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const is_approved = action === 'approve';
    
    const result = await pool.query(
      'UPDATE skills SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, req.params.id]
    );
    
    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.userId, `${action.toUpperCase()}_SKILL`, 'skill', req.params.id, `Skill: ${result.rows[0].name}`]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send platform message
router.post('/messages', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const result = await pool.query(
      'INSERT INTO platform_messages (title, message, type, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, message, type, req.user.userId]
    );
    
    // Log admin action
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.userId, 'SEND_MESSAGE', 'platform_message', result.rows[0].id, title]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reports
router.get('/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users, swaps, ratings, skills] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_users FROM users WHERE is_banned = false'),
      pool.query('SELECT COUNT(*) as total_swaps, status FROM swap_requests GROUP BY status'),
      pool.query('SELECT AVG(score) as avg_rating, COUNT(*) as total_ratings FROM ratings'),
      pool.query('SELECT COUNT(*) as total_skills, type FROM skills WHERE is_approved = true GROUP BY type')
    ]);
    
    res.json({
      users: users.rows[0],
      swaps: swaps.rows,
      ratings: ratings.rows[0],
      skills: skills.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download user activity report
router.get('/reports/user-activity', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.location, u.created_at,
             COUNT(DISTINCT sr1.id) as swaps_sent,
             COUNT(DISTINCT sr2.id) as swaps_received,
             COUNT(DISTINCT s.id) as total_skills,
             COUNT(DISTINCT r.id) as ratings_given
      FROM users u
      LEFT JOIN swap_requests sr1 ON u.id = sr1.sender_id
      LEFT JOIN swap_requests sr2 ON u.id = sr2.receiver_id
      LEFT JOIN skills s ON u.id = s.user_id
      LEFT JOIN ratings r ON u.id = r.rated_by
      GROUP BY u.id, u.name, u.email, u.location, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user-activity-report.csv');
    
    let csv = 'ID,Name,Email,Location,Joined Date,Swaps Sent,Swaps Received,Total Skills,Ratings Given\n';
    result.rows.forEach(row => {
      csv += `${row.id},"${row.name}","${row.email}","${row.location || ''}","${new Date(row.created_at).toLocaleDateString()}",${row.swaps_sent},${row.swaps_received},${row.total_skills},${row.ratings_given}\n`;
    });
    
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download feedback logs report
router.get('/reports/feedback-logs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.score, r.comment, r.created_at,
             rater.name as rater_name, rated.name as rated_user_name,
             sr.skill_offered, sr.skill_requested
      FROM ratings r
      JOIN users rater ON r.rated_by = rater.id
      JOIN users rated ON r.rated_user = rated.id
      JOIN swap_requests sr ON r.swap_id = sr.id
      ORDER BY r.created_at DESC
    `);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback-logs-report.csv');
    
    let csv = 'Rating ID,Score,Comment,Date,Rater Name,Rated User,Skill Offered,Skill Requested\n';
    result.rows.forEach(row => {
      csv += `${row.id},${row.score},"${row.comment || ''}","${new Date(row.created_at).toLocaleDateString()}","${row.rater_name}","${row.rated_user_name}","${row.skill_offered}","${row.skill_requested}"\n`;
    });
    
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Download swap stats report
router.get('/reports/swap-stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sr.id, sr.skill_offered, sr.skill_requested, sr.status, sr.created_at, sr.updated_at,
             sender.name as sender_name, receiver.name as receiver_name,
             sender.location as sender_location, receiver.location as receiver_location
      FROM swap_requests sr
      JOIN users sender ON sr.sender_id = sender.id
      JOIN users receiver ON sr.receiver_id = receiver.id
      ORDER BY sr.created_at DESC
    `);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=swap-stats-report.csv');
    
    let csv = 'Swap ID,Skill Offered,Skill Requested,Status,Created Date,Updated Date,Sender Name,Receiver Name,Sender Location,Receiver Location\n';
    result.rows.forEach(row => {
      csv += `${row.id},"${row.skill_offered}","${row.skill_requested}","${row.status}","${new Date(row.created_at).toLocaleDateString()}","${new Date(row.updated_at).toLocaleDateString()}","${row.sender_name}","${row.receiver_name}","${row.sender_location || ''}","${row.receiver_location || ''}"\n`;
    });
    
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;