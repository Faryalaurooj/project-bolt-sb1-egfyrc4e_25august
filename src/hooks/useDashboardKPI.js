import { useEffect, useState } from 'react';

const useDashboardKPI = () => {
  const [kpi, setKpi] = useState({
    totalContacts: 0,
    totalCampaigns: 0,
    textsSent: 0,
    callsMade: 0,
    emailsSent: 0,
    totalTouchpoints: 0,
    newPolicies: 0,
    revenue: 0,
    totalPipelineValue: 0,
    weightedPipelineValue: 0,
    openRate: '0%',
    replyRate: '0%',
    revenueByMonthData: null,
    pipelineValueTrendData: null,
    claimStatusData: null,
    policyTypeDistributionData: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        console.log('📊 Fetching KPI data...');
        setLoading(true);
        setError(null);
        
        // Check if backend is available
        const healthResponse = await fetch('/api/health');
        if (!healthResponse.ok) {
          throw new Error('Backend server is not responding');
        }
        
        const response = await fetch('/api/kpi');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 KPI data received:', data);
        setKpi(data);
      } catch (err) {
        console.error('❌ Error fetching KPI data:', err);
        setError(err.message);
        
        // Fallback to mock data if backend is unavailable
        console.log('📊 Using fallback KPI data');
        setKpi({
          totalContacts: 150,
          totalCampaigns: 25,
          textsSent: 450,
          callsMade: 89,
          emailsSent: 320,
          totalTouchpoints: 859,
          newPolicies: 45,
          revenue: 125000,
          totalPipelineValue: 450000,
          weightedPipelineValue: 275000,
          openRate: '48%',
          replyRate: '25%',
          revenueByMonthData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue',
              data: [18000, 22000, 19000, 25000, 21000, 23000],
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 2
            }]
          },
          pipelineValueTrendData: {
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
          },
          claimStatusData: {
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
          },
          policyTypeDistributionData: {
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
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKPI();
  }, []);

  return { kpi, loading, error };
};

// Helper function to get JWT token
const getJwtToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    if (response.ok) {
      const { token } = await response.json();
      return token;
    }
  } catch (error) {
    console.error('Failed to get JWT token:', error);
  }
  return null;
};

export default useDashboardKPI;