import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get messages for a specific contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data: messages, error } = await supabase
      .from('text_messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true }); // Order by creation time for chat history
    
    if (error) {
      console.error('Error fetching messages for contact:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages for contact:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages for a user-to-user conversation
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId; // Authenticated user's ID

    const { data: messages, error } = await supabase
      .from('text_messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true }); // Order by creation time for chat history
    
    if (error) {
      console.error('Error fetching messages for user conversation:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages for user conversation:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all messages for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    
    const { data: messages, error } = await supabase
      .from('text_messages')
      .select(`
        *,
        contacts(first_name, last_name, email, phone)
      `)
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching all messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      contact_id,
      recipient_id,
      sender_phone,
      recipient_phone,
      content,
      direction,
      status,
      sent_at,
      media_url,
      textmagic_id
    } = req.body;

    const newMessage = {
      sender_id: req.user.userId,
      contact_id: contact_id || null,
      recipient_id: recipient_id || null,
      sender_phone: sender_phone || null,
      recipient_phone: recipient_phone || null,
      content: content,
      direction: direction || 'outgoing',
      status: status || 'pending',
      sent_at: sent_at || new Date().toISOString(),
      media_url: media_url || null,
      textmagic_id: textmagic_id || null,
    };

    const { data: message, error } = await supabase
      .from('text_messages')
      .insert(newMessage)
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: 'Failed to create message' });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Update a message
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: message, error } = await supabase
      .from('text_messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('sender_id', req.user.userId) // Only allow updating own messages
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({ error: 'Failed to update message' });
    }

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('text_messages')
      .delete()
      .eq('id', id)
      .eq('sender_id', req.user.userId); // Only allow deleting own messages

    if (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({ error: 'Failed to delete message' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;