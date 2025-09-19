import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all notes for a contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('contact_id', req.params.contactId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .insert({
        ...req.body,
        created_by: req.user.userId
      })
      .select();
    
    if (error) {
      console.error('Error creating note:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!notes || notes.length === 0) {
      return res.status(500).json({ error: 'Failed to create note' });
    }
    
    res.status(201).json(notes[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();
    
    if (error) {
      console.error('Error updating note:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!notes || notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(notes[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', req.params.id);
    
    if (error) {
      console.error('Error deleting note:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;