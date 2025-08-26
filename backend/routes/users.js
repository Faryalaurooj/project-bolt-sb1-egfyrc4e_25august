import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'contact_number', 'outlook_email', 'created_at')
      .orderBy('created_at', 'desc');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'contact_number', 'outlook_email', 'created_at')
      .where('id', req.user.userId)
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, contact_number, outlook_email } = req.body; // Include outlook_email
    
    const [user] = await db('users')
      .where('id', req.user.userId)
      .update({
        first_name,
        last_name,
        contact_number,
        outlook_email, // Save outlook_email
        outlook_email,
        updated_at: new Date()
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'contact_number', 'outlook_email', 'created_at']);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;