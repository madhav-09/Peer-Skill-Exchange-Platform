const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, location, profile_photo_url, availability FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, location, availability } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, location = $2, availability = $3 WHERE id = $4 RETURNING id, name, email, location, profile_photo_url, availability',
      [name, location, availability, req.user.userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users - FIXED WITH PROPER FILTERING
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { skill, location, name } = req.query;
    console.log('Search params:', { skill, location, name });
    
    let query = 'SELECT id, name, location, profile_photo_url, availability FROM users WHERE id != $1 AND role != \'admin\'';
    const params = [req.user.userId];
    
    // Add name filter
    if (name && name.trim()) {
      query += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${name.trim()}%`);
    }
    
    // Add location filter
    if (location && location.trim()) {
      query += ` AND location ILIKE $${params.length + 1}`;
      params.push(`%${location.trim()}%`);
    }
    
    // Add skill filter
    if (skill && skill.trim()) {
      query += ` AND EXISTS (SELECT 1 FROM skills WHERE user_id = users.id AND name ILIKE $${params.length + 1})`;
      params.push(`%${skill.trim()}%`);
    }
    
    query += ' ORDER BY name LIMIT 20';
    
    console.log('Final query:', query);
    console.log('Query params:', params);
    
    const result = await pool.query(query, params);
    console.log('Found users:', result.rows.length);
    
    // Add skills for each user
    const usersWithSkills = await Promise.all(
      result.rows.map(async (user) => {
        try {
          const skillsResult = await pool.query(
            'SELECT name FROM skills WHERE user_id = $1',
            [user.id]
          );
          return {
            ...user,
            skills: skillsResult.rows.map(s => s.name)
          };
        } catch (error) {
          return {
            ...user,
            skills: []
          };
        }
      })
    );
    
    res.json(usersWithSkills);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const userResult = await pool.query(
      'SELECT id, name, email, location, profile_photo_url, availability, created_at FROM users WHERE id = $1 AND role != \'admin\'',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get user skills
    const skillsResult = await pool.query(
      'SELECT name, type FROM skills WHERE user_id = $1',
      [userId]
    );
    
    const skills_offered = skillsResult.rows.filter(skill => skill.type === 'offered').map(skill => skill.name);
    const skills_wanted = skillsResult.rows.filter(skill => skill.type === 'wanted').map(skill => skill.name);
    
    res.json({
      ...user,
      skills_offered,
      skills_wanted
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;