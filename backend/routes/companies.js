import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Create a new company
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🏢 Backend: POST /api/companies called');
    console.log('🏢 Backend: Request body:', req.body);
    console.log('🏢 Backend: User ID:', req.user?.userId);
    
    const { 
      name, 
      domain, 
      industry, 
      address, 
      city, 
      state, 
      zip, 
      phone, 
      email, 
      notes 
    } = req.body;

    // Validate required fields
    if (!name) {
      console.log('🏢 Backend: Validation failed - name is required');
      return res.status(400).json({ error: 'Company name is required' });
    }

    console.log('🏢 Backend: Inserting company into database...');
    console.log('🏢 Backend: Attempting database insert...');
    const [company] = await db('companies')
      .insert({
        name,
        domain: domain || null,
        industry: industry || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        created_by: req.user.userId
      })
      .returning('*');

    console.log('🏢 Backend: ✅ Company created successfully:', company);
    res.status(201).json(company);
  } catch (error) {
    console.error('🏢 Backend: ❌ Error creating company:', error);
    console.error('🏢 Backend: Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    console.log('🏢 Backend: Sending 500 error response for company creation.');
    console.error('🏢 Backend: Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    console.log('🏢 Backend: Sending 500 error response for company creation.');
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Get all companies for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const companies = await db('companies')
      .where('created_by', req.user.userId)
      .orderBy('name', 'asc');

    res.json(companies);
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get a specific company by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const company = await db('companies')
      .where('id', req.params.id)
      .andWhere('created_by', req.user.userId)
      .first();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('❌ Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Update a company
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      domain, 
      industry, 
      address, 
      city, 
      state, 
      zip, 
      phone, 
      email, 
      notes 
    } = req.body;

    const [company] = await db('companies')
      .where('id', req.params.id)
      .andWhere('created_by', req.user.userId)
      .update({
        name,
        domain: domain || null,
        industry: industry || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        updated_at: new Date()
      })
      .returning('*');

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete a company
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const count = await db('companies')
      .where('id', req.params.id)
      .andWhere('created_by', req.user.userId)
      .del();

    if (count === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Link a contact to a company
router.post('/:companyId/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { companyId, contactId } = req.params;
    const { relationship_type = 'employee' } = req.body;

    // Verify the company belongs to the authenticated user
    const company = await db('companies')
      .where('id', companyId)
      .andWhere('created_by', req.user.userId)
      .first();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if the link already exists
    const existingLink = await db('contact_companies')
      .where('contact_id', contactId)
      .andWhere('company_id', companyId)
      .first();

    if (existingLink) {
      return res.status(400).json({ error: 'Contact is already linked to this company' });
    }

    const [link] = await db('contact_companies')
      .insert({
        contact_id: contactId,
        company_id: companyId,
        relationship_type
      })
      .returning('*');

    res.status(201).json(link);
  } catch (error) {
    console.error('❌ Error linking contact to company:', error);
    res.status(500).json({ error: 'Failed to link contact to company' });
  }
});

// Remove a contact from a company
router.delete('/:companyId/contacts/:contactId', authenticateToken, async (req, res) => {
  try {
    const { companyId, contactId } = req.params;

    // Verify the company belongs to the authenticated user
    const company = await db('companies')
      .where('id', companyId)
      .andWhere('created_by', req.user.userId)
      .first();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const count = await db('contact_companies')
      .where('contact_id', contactId)
      .andWhere('company_id', companyId)
      .del();

    if (count === 0) {
      return res.status(404).json({ error: 'Contact-company link not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('❌ Error removing contact from company:', error);
    res.status(500).json({ error: 'Failed to remove contact from company' });
  }
});

export default router;