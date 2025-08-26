import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Get all phone calls for a contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const calls = await db('phone_calls')
      .where('contact_id', req.params.contactId)
      .orderBy('created_at', 'desc');
    res.json(calls);
  } catch (error) {
    console.error('Error fetching phone calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new phone call
router.post('/', authenticateToken, async (req, res) => {
  try {
    const [call] = await db('phone_calls')
      .insert({
        ...req.body,
        created_by: req.user.userId
      })
      .returning('*');
    res.status(201).json(call);
  } catch (error) {
    console.error('Error creating phone call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a phone call
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const [call] = await db('phone_calls')
      .where('id', req.params.id)
      .update({
        ...req.body,
        updated_at: new Date()
      })
      .returning('*');
    
    if (!call) {
      return res.status(404).json({ error: 'Phone call not found' });
    }
    
    res.json(call);
  } catch (error) {
    console.error('Error updating phone call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a phone call
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const count = await db('phone_calls')
      .where('id', req.params.id)
      .del();
    
    if (count === 0) {
      return res.status(404).json({ error: 'Phone call not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting phone call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;