import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Create a new company
router.post('/',  async (req, res) => {
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
      notes ,
      created_by
    } = req.body;

    // Validate required fields
    if (!name) {
      console.log('🏢 Backend: Validation failed - name is required');
      return res.status(400).json({ error: 'Company name is required' });
    }

    console.log('🏢 Backend: Inserting company into database...');
    console.log('🏢 Backend: Attempting database insert...');
    const { data: company, error } = await supabase
      .from('companies')
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
        created_by: created_by
      })
      .select()
      .single();

    if (error) {
      console.error('🏢 Backend: ❌ Supabase error creating company:', error);
      return res.status(500).json({ error: 'Failed to create company' });
    }

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
router.get('/',  async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching companies:', error);
      return res.status(500).json({ error: 'Failed to fetch companies' });
    }

    res.json(companies);
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get a specific company by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .eq('created_by', req.user.userId);

    if (error) {
      console.error('❌ Error fetching company:', error);
      return res.status(500).json({ error: 'Failed to fetch company' });
    }

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(companies[0]);
  } catch (error) {
    console.error('❌ Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Update a company
router.put('/:id', async (req, res) => {
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

    const { data: companies, error } = await supabase
      .from('companies')
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
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) {
      console.error('❌ Error updating company:', error);
      return res.status(500).json({ error: 'Failed to update company' });
    }

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(companies[0]);
  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete a company
router.delete('/:id',  async (req, res) => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('❌ Error deleting company:', error);
      return res.status(500).json({ error: 'Failed to delete company' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Link a contact to a company
router.post('/:companyId/contacts/:contactId',  async (req, res) => {
  try {
    const { companyId, contactId } = req.params;
    const { relationship_type = 'employee' } = req.body;

    // Verify the company belongs to the authenticated user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('created_by', req.user.userId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if the link already exists
    const { data: existingLinks } = await supabase
      .from('contact_companies')
      .select('id')
      .eq('contact_id', contactId)
      .eq('company_id', companyId);

    if (existingLinks && existingLinks.length > 0) {
      return res.status(400).json({ error: 'Contact is already linked to this company' });
    }

    const { data: link, error } = await supabase
      .from('contact_companies')
      .insert({
        contact_id: contactId,
        company_id: companyId,
        relationship_type
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error linking contact to company:', error);
      return res.status(500).json({ error: 'Failed to link contact to company' });
    }

    res.status(201).json(link);
  } catch (error) {
    console.error('❌ Error linking contact to company:', error);
    res.status(500).json({ error: 'Failed to link contact to company' });
  }
});

// Remove a contact from a company
router.delete('/:companyId/contacts/:contactId',  async (req, res) => {
  try {
    const { companyId, contactId } = req.params;

    // Verify the company belongs to the authenticated user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('created_by', req.user.userId)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const { error } = await supabase
      .from('contact_companies')
      .delete()
      .eq('contact_id', contactId)
      .eq('company_id', companyId);

    if (error) {
      console.error('❌ Error removing contact from company:', error);
      return res.status(500).json({ error: 'Failed to remove contact from company' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('❌ Error removing contact from company:', error);
    res.status(500).json({ error: 'Failed to remove contact from company' });
  }
});

export default router;