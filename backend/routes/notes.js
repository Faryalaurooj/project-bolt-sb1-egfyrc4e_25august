import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Get all notes for a contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const notes = await db('notes')
      .where('contact_id', req.params.contactId)
      .orderBy('created_at', 'desc');
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
router.post('/', authenticateToken, async (req, res) => {
  try {
    const [note] = await db('notes')
      .insert({
        ...req.body,
        created_by: req.user.userId
      })
      .returning('*');
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const [note] = await db('notes')
      .where('id', req.params.id)
      .update({
        ...req.body,
        updated_at: new Date()
      })
      .returning('*');
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const count = await db('notes')
      .where('id', req.params.id)
      .del();
    
    if (count === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;