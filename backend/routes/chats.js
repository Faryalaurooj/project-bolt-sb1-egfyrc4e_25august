import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Get messages for a specific contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const messages = await db('text_messages')
      .where('contact_id', contactId)
      .orderBy('created_at', 'asc'); // Order by creation time for chat history
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

    const messages = await db('text_messages')
      .where(function() {
        this.where('sender_id', currentUserId).andWhere('recipient_id', userId);
      })
      .orWhere(function() {
        this.where('sender_id', userId).andWhere('recipient_id', currentUserId);
      })
      .orderBy('created_at', 'asc'); // Order by creation time for chat history
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
    
    const messages = await db('text_messages')
      .leftJoin('contacts', 'text_messages.contact_id', 'contacts.id')
      .select(
        'text_messages.*',
        'contacts.first_name',
        'contacts.last_name',
        'contacts.email',
        'contacts.phone'
      )
      .where('text_messages.sender_id', currentUserId)
      .orWhere('text_messages.recipient_id', currentUserId)
      .orderBy('text_messages.created_at', 'desc');
    
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
      sent_at: sent_at || db.fn.now(),
      media_url: media_url || null,
      textmagic_id: textmagic_id || null,
      created_at: db.fn.now(),
    };

    const [message] = await db('text_messages')
      .insert(newMessage)
      .returning('*');

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

    const [message] = await db('text_messages')
      .where('id', id)
      .andWhere('sender_id', req.user.userId) // Only allow updating own messages
      .update({
        ...updates,
        updated_at: db.fn.now()
      })
      .returning('*');

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

    const count = await db('text_messages')
      .where('id', id)
      .andWhere('sender_id', req.user.userId) // Only allow deleting own messages
      .del();

    if (count === 0) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;