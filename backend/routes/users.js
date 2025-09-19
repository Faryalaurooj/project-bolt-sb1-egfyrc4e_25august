import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all users
router.get('/',  async (req, res) => {
  console.log("call__")
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, contact_number, outlook_email, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, contact_number, outlook_email, created_at')
      .eq('id', req.user.userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
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
router.put('/profile',  async (req, res) => {
  try {
    const { first_name, last_name, contact_number, outlook_email } = req.body; // Include outlook_email
    
    const { data: user, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        contact_number,
        outlook_email,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.userId)
      .select('id, email, first_name, last_name, contact_number, outlook_email, created_at')
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
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