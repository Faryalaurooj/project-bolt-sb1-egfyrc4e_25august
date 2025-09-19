import { supabase } from './lib/supabase.js';

/**
 * Script to check the policies table in Supabase
 * Note: Schema changes should be done through Supabase migrations, not this script
 * This script only checks the current state and provides information
 */

async function checkPoliciesTable() {
  try {
    console.log('🔄 Checking policies table...');
    
    // Check if we can access the policies table
    const { data: sampleData, error: sampleError } = await supabase
      .from('policies')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing policies table:', sampleError.message);
      console.log('   This might mean the table does not exist or there are permission issues');
      return;
    }

    console.log('✅ Policies table is accessible');

    // Get a sample record to see the current structure
    if (sampleData && sampleData.length > 0) {
      const sampleRecord = sampleData[0];
      console.log('📋 Current columns in policies table:');
      console.log(Object.keys(sampleRecord));
      
      // Check for key policy fields
      const keyPolicyFields = [
        'id',
        'policy_number',
        'contact_id',
        'company',
        'premium',
        'effective_date',
        'expiration_date',
        'policy_type',
        'created_at',
        'updated_at'
      ];

      const presentFields = keyPolicyFields.filter(field => field in sampleRecord);
      const missingFields = keyPolicyFields.filter(field => !(field in sampleRecord));
      
      console.log('✅ Present key policy fields:', presentFields);
      
      if (missingFields.length > 0) {
        console.log('⚠️  Missing key policy fields:', missingFields);
        console.log('   These should be added through Supabase migrations');
      } else {
        console.log('✅ All key policy fields are present');
      }

    } else {
      console.log('📋 No data in policies table to analyze schema');
    }

    // Get count of records
    const { count, error: countError } = await supabase
      .from('policies')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error getting record count:', countError.message);
    } else {
      console.log(`📊 Total policies in table: ${count}`);
    }

    console.log('✅ Policies table check complete');
    console.log('💡 Note: Schema changes should be made through Supabase migrations, not this script');

  } catch (error) {
    console.error('❌ Error checking policies table:', error);
  }
}

// Run the check
checkPoliciesTable();