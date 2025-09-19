import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Create a new policy
router.post('/', async (req, res) => {
  try {
 
    
    const { 
      policyEntry,
      company,
      product,
      paymentPlan,
      policyNumber,
      purePremium,
      paymentDueDay,
      effDate,
      expDate,
      source,
      subSource,
      policyAgentOfRecord,
      policyCSR,
      priorPolicyNumber,
      memo,
      commissionSplit,
      contact_id,
      created_by
    } = req.body;

    // Validate required fields - policy number is optional for now
    // if (!policy_number) {
    //   console.log('📋 Backend: Validation failed - policy_number is required');
    //   return res.status(400).json({ error: 'Policy number is required' });
    // }

    console.log('📋 Backend: Inserting policy into database...');
    
    // Map frontend data directly to database columns
    const policyData = {
      contact_id: contact_id || null,
      policy_entry: policyEntry || 'New Business',
      policy_type: product || null,
      company: company || null,
      product: product || null,
      policy_number: policyNumber || null,
      effective_date: effDate || null,
      eff_date: effDate || null,
      expiration_date: expDate || null,
      exp_date: expDate || null,
      premium: purePremium ? parseFloat(purePremium) : null,
      pfm_level: paymentPlan || null,
      payment_plan: paymentPlan || null,
      policy_forms: memo || null,
      memo: memo || null,
      source: source || null,
      sub_source: subSource || null,
      policy_agent_of_record: policyAgentOfRecord || null,
      policy_csr: policyCSR || null,
      prior_policy_number: priorPolicyNumber || null,
      payment_due_day: paymentDueDay ? parseInt(paymentDueDay) : null,
      commission_split: commissionSplit || '100.00%',
      created_by: created_by || null
    };
    
    const { data: policy, error } = await supabase
      .from('policies')
      .insert(policyData)
      .select()
      .single();

    if (error) {
      console.error('📋 Backend: ❌ Supabase error creating policy:', error);
      return res.status(500).json({ error: 'Failed to create policy' });
    }

    res.status(201).json(policy);
  } catch (error) {
    console.error('📋 Backend: ❌ Error creating policy:', error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
});

// Get all policies for the authenticated user
router.get('/',  async (req, res) => {
  try {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching policies:', error);
      return res.status(500).json({ error: 'Failed to fetch policies' });
    }

    res.json(policies);
  } catch (error) {
    console.error('❌ Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// Get policies by contact ID
router.get('/contact/:contactId', authenticateToken, async (req, res) => {
  try {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*')
      .eq('contact_id', req.params.contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching policies by contact:', error);
      return res.status(500).json({ error: 'Failed to fetch policies' });
    }

    res.json(policies);
  } catch (error) {
    console.error('❌ Error fetching policies by contact:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// Get a specific policy by ID
router.get('/:id',  async (req, res) => {
  try {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*')
      .eq('id', req.params.id);

    if (error) {
      console.error('❌ Error fetching policy:', error);
      return res.status(500).json({ error: 'Failed to fetch policy' });
    }

    if (!policies || policies.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policies[0]);
  } catch (error) {
    console.error('❌ Error fetching policy:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// Update a policy
router.put('/:id',  async (req, res) => {
  try {
    const { 
      policyEntry,
      company,
      product,
      paymentPlan,
      policyNumber,
      purePremium,
      paymentDueDay,
      effDate,
      expDate,
      source,
      subSource,
      policyAgentOfRecord,
      policyCSR,
      priorPolicyNumber,
      memo,
      commissionSplit
    } = req.body;

    // Map frontend data directly to database columns
    const policyData = {
      policy_entry: policyEntry || 'New Business',
      policy_type: product || null,
      company: company || null,
      product: product || null,
      policy_number: policyNumber || null,
      effective_date: effDate || null,
      eff_date: effDate || null,
      expiration_date: expDate || null,
      exp_date: expDate || null,
      premium: purePremium ? parseFloat(purePremium) : null,
      pfm_level: paymentPlan || null,
      payment_plan: paymentPlan || null,
      policy_forms: memo || null,
      memo: memo || null,
      source: source || null,
      sub_source: subSource || null,
      policy_agent_of_record: policyAgentOfRecord || null,
      policy_csr: policyCSR || null,
      prior_policy_number: priorPolicyNumber || null,
      payment_due_day: paymentDueDay ? parseInt(paymentDueDay) : null,
      commission_split: commissionSplit || '100.00%',
      updated_at: new Date()
    };

    const { data: policies, error } = await supabase
      .from('policies')
      .update(policyData)
      .eq('id', req.params.id)
      .select();

    if (error) {
      console.error('❌ Error updating policy:', error);
      return res.status(500).json({ error: 'Failed to update policy' });
    }

    if (!policies || policies.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policies[0]);
  } catch (error) {
    console.error('❌ Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// Delete a policy
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('❌ Error deleting policy:', error);
      return res.status(500).json({ error: 'Failed to delete policy' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('❌ Error deleting policy:', error);
    res.status(500).json({ error: 'Failed to delete policy' });
  }
});

export default router;