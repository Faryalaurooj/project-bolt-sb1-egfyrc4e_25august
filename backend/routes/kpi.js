import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get KPI data
router.get('/', async (req, res) => {
  try {
    // Fetch basic counts from database
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });
    
    const { count: textsCount } = await supabase
      .from('phone_calls')
      .select('*', { count: 'exact', head: true });
    
    const { count: emailsCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });
    
    const { count: textCampaignsCount } = await supabase
      .from('text_campaigns')
      .select('*', { count: 'exact', head: true });
    
    const { count: emailTemplatesCount } = await supabase
      .from('email_templates')
      .select('*', { count: 'exact', head: true });
    
    const { count: policiesCount } = await supabase
      .from('policy_documents')
      .select('*', { count: 'exact', head: true });
    
    // Parse counts (handle null values)
    const totalContacts = contactsCount || 0;
    const textsSent = textsCount || 0;
    const callsMade = textsCount || 0; // Using phone_calls for calls made
    const emailsSent = emailsCount || 0;
    const totalTextCampaigns = textCampaignsCount || 0;
    const totalEmailTemplates = emailTemplatesCount || 0;
    const newPolicies = policiesCount || 0;
    
    // Calculate derived metrics
    const totalCampaigns = totalTextCampaigns + totalEmailTemplates;
    const totalTouchpoints = emailsSent + textsSent + callsMade;
    
    // Mock data for metrics not directly available in current schema
    const openRate = '48%';
    const replyRate = '25%';
    const revenue = 125000;
    const totalPipelineValue = 450000;
    const weightedPipelineValue = 275000;
    
    // Mock chart data
    const revenueByMonthData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [18000, 22000, 19000, 25000, 21000, 23000],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      }]
    };
    
    const pipelineValueTrendData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Total Pipeline',
          data: [380000, 420000, 390000, 450000, 430000, 450000],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Weighted Pipeline',
          data: [220000, 250000, 240000, 275000, 260000, 275000],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          fill: true
        }
      ]
    };
    
    const claimStatusData = {
      labels: ['Pending', 'Approved', 'Denied', 'Under Review'],
      datasets: [{
        data: [45, 120, 15, 30],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2
      }]
    };
    
    const policyTypeDistributionData = {
      labels: ['Auto', 'Home', 'Life', 'Business', 'Health'],
      datasets: [{
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(5, 150, 105, 0.8)',
          'rgba(4, 120, 87, 0.8)',
          'rgba(6, 95, 70, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(5, 150, 105, 1)',
          'rgba(4, 120, 87, 1)',
          'rgba(6, 95, 70, 1)'
        ],
        borderWidth: 2
      }]
    };

    const result = {
      totalContacts,
      totalCampaigns,
      textsSent,
      callsMade,
      emailsSent,
      totalTouchpoints,
      newPolicies,
      revenue,
      totalPipelineValue,
      weightedPipelineValue,
      openRate,
      replyRate,
      revenueByMonthData,
      pipelineValueTrendData,
      claimStatusData,
      policyTypeDistributionData,
    };

    console.log("🔢 KPI Response:", result);
    res.json(result);
  } catch (err) {
    console.error("❌ KPI Route Error:", err);
    res.status(500).json({ error: 'Failed to fetch KPI data' });
  }
});

export default router;