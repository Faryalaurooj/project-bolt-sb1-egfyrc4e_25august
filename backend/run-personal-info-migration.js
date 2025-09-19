import { supabase } from './lib/supabase.js';

/**
 * Script to check personal information fields in contacts table
 * Note: Schema changes should be done through Supabase migrations, not this script
 * This script only checks the current state and provides information
 */

async function checkPersonalInfoFields() {
  try {
    console.log('🔄 Checking personal information fields in contacts table...');
    
    // Check if we can access the contacts table
    const { data: sampleData, error: sampleError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing contacts table:', sampleError.message);
      return;
    }

    console.log('✅ Contacts table is accessible');

    // Get a sample record to see the current structure
    if (sampleData && sampleData.length > 0) {
      const sampleRecord = sampleData[0];
      console.log('📋 Current columns in contacts table:');
      console.log(Object.keys(sampleRecord));
      
      // Check for personal information fields
      const personalInfoFields = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'date_of_birth',
        'ssn'
      ];

      const presentFields = personalInfoFields.filter(field => field in sampleRecord);
      const missingFields = personalInfoFields.filter(field => !(field in sampleRecord));
      
      console.log('✅ Present personal info fields:', presentFields);
      
      if (missingFields.length > 0) {
        console.log('⚠️  Missing personal info fields:', missingFields);
        console.log('   These should be added through Supabase migrations');
      } else {
        console.log('✅ All personal information fields are present');
      }

    } else {
      console.log('📋 No data in contacts table to analyze schema');
    }

    // Get count of records
    const { count, error: countError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Error getting record count:', countError.message);
    } else {
      console.log(`📊 Total contacts in table: ${count}`);
    }

    console.log('✅ Personal info fields check complete');
    console.log('💡 Note: Schema changes should be made through Supabase migrations, not this script');

  } catch (error) {
    console.error('❌ Error checking personal info fields:', error);
  }
}

// Run the check
checkPersonalInfoFields();