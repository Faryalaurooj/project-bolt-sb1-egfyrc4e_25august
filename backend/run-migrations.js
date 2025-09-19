import { supabase } from './lib/supabase.js';

/**
 * Script to check Supabase database status
 * Note: Supabase handles migrations through its own system, not Knex
 * This script checks the current state of the database
 */

async function checkDatabaseStatus() {
  try {
    console.log('🔄 Checking Supabase database status...');
    
    // Test basic connectivity
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log('❌ Database connection error:', healthError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Check key tables
    const tables = [
      'users',
      'contacts', 
      'companies',
      'policies',
      'notes',
      'phone_calls',
      'text_messages'
    ];

    console.log('📋 Checking table accessibility...');
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    console.log('✅ Database status check complete');
    console.log('💡 Note: Supabase migrations are handled through the Supabase dashboard or CLI');

  } catch (error) {
    console.error('❌ Database check error:', error);
  }
}

// Run the check
checkDatabaseStatus();