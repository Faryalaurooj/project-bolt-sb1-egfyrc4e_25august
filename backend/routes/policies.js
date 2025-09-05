import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

// Helper function to validate and clean date values
const cleanDateValue = (dateValue) => {
  if (!dateValue || dateValue.trim() === '' || dateValue === 'null' || dateValue === 'undefined') {
    return null;
  }
  // Validate that it's a proper date format
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    return null;
  }
  return dateValue;
};

const router = express.Router();

// Create a new policy
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      contact_id, 
      policy_type, 
      company, 
      policy_number, 
      effective_date, 
      expiration_date, 
      premium, 
      pfm_level, 
      policy_forms,
      raw_data 
    } = req.body;

    const [policy] = await db('policies')
      .insert({
        contact_id,
        policy_type,
        company,
        policy_number,
        effective_date: cleanDateValue(effective_date),
        expiration_date: cleanDateValue(expiration_date),
        premium,
        pfm_level,
        policy_forms,
        raw_data,
        created_by: req.user.userId
      })
      .returning('*');

    res.status(201).json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get policies for a specific contact
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const policies = await db('policies')
      .where('contact_id', req.params.contactId)
      .andWhere('created_by', req.user.userId)
      .orderBy('created_at', 'desc');

    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies for contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all policies for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const policies = await db('policies')
      .select('policies.*', 'contacts.first_name', 'contacts.last_name')
      .leftJoin('contacts', 'policies.contact_id', 'contacts.id')
      .where('policies.created_by', req.user.userId)
      .orderBy('policies.created_at', 'desc');

    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a policy
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { effective_date, expiration_date, ...otherFields } = req.body;
    
    const updateData = {
      ...otherFields,
      effective_date: cleanDateValue(effective_date),
      expiration_date: cleanDateValue(expiration_date),
      updated_at: new Date()
    };
    
    const [policy] = await db('policies')
      .where('id', req.params.id)
      .andWhere('created_by', req.user.userId)
      .update(updateData)
      .returning('*');
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    res.json(policy);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a policy
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const count = await db('policies')
      .where('id', req.params.id)
      .andWhere('created_by', req.user.userId)
      .del();
    
    if (count === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;