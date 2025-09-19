import { supabase } from './lib/supabase.js';

/**
 * Script to check the policies table schema in Supabase
 * Note: Schema changes should be done through Supabase migrations, not this script
 * This script only checks the current state and provides information
 */

async function checkPoliciesSchema() {
  try {
    console.log('🔧 Checking policies table schema...');

    // Check if we can access the policies table
    const { data: sampleData, error: sampleError } = await supabase
      .from('policies')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing policies table:', sampleError.message);
      return;
    }

    console.log('✅ Policies table is accessible');

    // Get a sample record to see the current structure
    if (sampleData && sampleData.length > 0) {
      const sampleRecord = sampleData[0];
      console.log('📋 Current columns in policies table:');
      console.log(Object.keys(sampleRecord));
      
      // Check for required columns
      const requiredColumns = [
        'policy_type',
        'effective_date', 
        'expiration_date',
        'pfm_level',
        'policy_forms',
        'raw_data'
      ];

      const missingColumns = requiredColumns.filter(col => !(col in sampleRecord));
      
      if (missingColumns.length > 0) {
        console.log('⚠️  Missing columns:', missingColumns);
        console.log('   These should be added through Supabase migrations');
      } else {
        console.log('✅ All required columns are present');
      }

      // Check for old columns that might need to be migrated
      const oldColumns = [
        'policy_entry',
        'product', 
        'payment_plan',
        'payment_due_day',
        'eff_date',
        'exp_date',
        'source',
        'sub_source',
        'policy_agent_of_record',
        'policy_csr',
        'prior_policy_number',
        'memo',
        'commission_split'
      ];

      const presentOldColumns = oldColumns.filter(col => col in sampleRecord);
      
      if (presentOldColumns.length > 0) {
        console.log('📋 Old columns present (consider migrating to raw_data):', presentOldColumns);
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

    console.log('✅ Schema check complete');
    console.log('💡 Note: Schema changes should be made through Supabase migrations, not this script');

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

// Run the schema check
checkPoliciesSchema();