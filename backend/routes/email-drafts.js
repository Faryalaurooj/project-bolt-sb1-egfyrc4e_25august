import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all email drafts for the authenticated user
router.get('/', async (req, res) => {
  try {
    // Get user ID from query parameters (sent from frontend)
    const userId = req.query.user_id || req.query.created_by;
    
    if (!userId) {
      console.error('❌ No user ID found in query parameters');
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log('📝 getEmailDrafts: Fetching drafts for user:', userId);
    
    const { data: drafts, error } = await supabase
      .from('emails')
      .select('*')
      .eq('created_by', userId)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error in getEmailDrafts:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('📝 getEmailDrafts: Retrieved drafts:', drafts?.length || 0);
    res.json(drafts || []);
  } catch (error) {
    console.error('❌ Error in getEmailDrafts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save email draft
router.post('/', async (req, res) => {
  try {
    console.log('📝 saveEmailDraft: req.body:', req.body);
    
    // Get user ID from request body (sent from frontend)
    const userId = req.body.user_id || req.body.created_by;
    
    if (!userId) {
      console.error('❌ No user ID found in request body');
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const draftData = req.body;

    // Transform the data to match the emails table schema
    const transformedData = {
      subject: draftData.subject,
      content: draftData.body || draftData.content,
      to_recipients: draftData.to_emails ? JSON.stringify(draftData.to_emails.split(',').map(email => email.trim()).filter(email => email)) : JSON.stringify([]),
      cc_recipients: draftData.cc_emails ? JSON.stringify(draftData.cc_emails.split(',').map(email => email.trim()).filter(email => email)) : JSON.stringify([]),
      bcc_recipients: draftData.bcc_emails ? JSON.stringify(draftData.bcc_emails.split(',').map(email => email.trim()).filter(email => email)) : JSON.stringify([]),
      status: 'draft',
      sent_at: null, // Drafts don't have a sent_at time
      attachments: draftData.attachments_count ? JSON.stringify({ count: draftData.attachments_count }) : null,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log('📝 saveEmailDraft: Saving draft with data:', transformedData);

    const { data: draft, error } = await supabase
      .from('emails')
      .insert(transformedData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error in saveEmailDraft:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('📝 saveEmailDraft: Draft saved successfully:', draft);
    res.json(draft);
  } catch (error) {
    console.error('❌ Error in saveEmailDraft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update email draft
router.put('/:id', async (req, res) => {
  try {
    // Get user ID from request body (sent from frontend)
    const userId = req.body.user_id || req.body.created_by;
    
    if (!userId) {
      console.error('❌ No user ID found in request body');
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const draftId = req.params.id;
    const draftData = req.body;

    // Transform the data to match the emails table schema
    const transformedData = {
      subject: draftData.subject,
      content: draftData.body || draftData.content,
      to_recipients: draftData.to_emails ? JSON.stringify(draftData.to_emails.split(',').map(email => email.trim()).filter(email => email)) : JSON.stringify([]),
      cc_recipients: draftData.cc_emails ? JSON.stringify(draftData.cc_emails.split(',').map(email => email.trim()).filter(email => email)) : JSON.stringify([]),
      bcc_recipients: draftData.bcc_emails ? JSON.stringify(draftData.bcc_emails.split(',').map(email => email.trim()).filter(email => email)) : JSON.stringify([]),
      status: 'draft',
      attachments: draftData.attachments_count ? JSON.stringify({ count: draftData.attachments_count }) : null,
      updated_at: new Date()
    };

    console.log('📝 updateEmailDraft: Updating draft with data:', transformedData);

    const { data: draft, error } = await supabase
      .from('emails')
      .update(transformedData)
      .eq('id', draftId)
      .eq('created_by', userId)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) {
      console.error('❌ Error in updateEmailDraft:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    console.log('📝 updateEmailDraft: Draft updated successfully:', draft);
    res.json(draft);
  } catch (error) {
    console.error('❌ Error in updateEmailDraft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete email draft
router.delete('/:id', async (req, res) => {
  try {
    // Get user ID from query parameters (sent from frontend)
    const userId = req.query.user_id || req.query.created_by;
    
    if (!userId) {
      console.error('❌ No user ID found in query parameters');
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const draftId = req.params.id;

    console.log('📝 deleteEmailDraft: Deleting draft:', draftId, 'for user:', userId);

    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', draftId)
      .eq('created_by', userId)
      .eq('status', 'draft');

    if (error) {
      console.error('❌ Error in deleteEmailDraft:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('📝 deleteEmailDraft: Draft deleted successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in deleteEmailDraft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
