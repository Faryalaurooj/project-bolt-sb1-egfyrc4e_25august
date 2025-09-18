import { db } from './db.js';

/**
 * Script to fix the policies table schema to match Supabase
 * This will add missing columns and ensure proper data types
 */

async function fixPoliciesSchema() {
  try {
    console.log('🔧 Fixing policies table schema...');

    // Check if the table exists and get its current structure
    const tableExists = await db.schema.hasTable('policies');
    if (!tableExists) {
      console.log('❌ Policies table does not exist. Please run migrations first.');
      return;
    }

    // Get current columns
    const columns = await db('policies').columnInfo();
    console.log('📋 Current columns:', Object.keys(columns));

    // Check if we need to add missing columns
    const requiredColumns = [
      'policy_type',
      'effective_date', 
      'expiration_date',
      'pfm_level',
      'policy_forms',
      'raw_data'
    ];

    const missingColumns = requiredColumns.filter(col => !columns[col]);
    
    if (missingColumns.length > 0) {
      console.log('🔧 Adding missing columns:', missingColumns);
      
      // Add missing columns one by one
      for (const column of missingColumns) {
        try {
          switch (column) {
            case 'policy_type':
              await db.schema.alterTable('policies', table => {
                table.text('policy_type');
              });
              break;
            case 'effective_date':
              await db.schema.alterTable('policies', table => {
                table.date('effective_date');
              });
              break;
            case 'expiration_date':
              await db.schema.alterTable('policies', table => {
                table.date('expiration_date');
              });
              break;
            case 'pfm_level':
              await db.schema.alterTable('policies', table => {
                table.text('pfm_level');
              });
              break;
            case 'policy_forms':
              await db.schema.alterTable('policies', table => {
                table.text('policy_forms');
              });
              break;
            case 'raw_data':
              await db.schema.alterTable('policies', table => {
                table.jsonb('raw_data');
              });
              break;
          }
          console.log(`   ✅ Added column: ${column}`);
        } catch (error) {
          console.log(`   ⚠️  Column ${column} might already exist:`, error.message);
        }
      }
    } else {
      console.log('✅ All required columns already exist');
    }

    // Check if we need to remove old columns that don't match Supabase schema
    const oldColumns = [
      'policy_entry',
      'product', 
      'payment_plan',
      'policy_number', // This should stay
      'premium', // This should stay
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

    const columnsToRemove = oldColumns.filter(col => columns[col]);
    
    if (columnsToRemove.length > 0) {
      console.log('⚠️  Found old columns that should be moved to raw_data:', columnsToRemove);
      console.log('   These will be preserved in raw_data field instead of being deleted');
    }

    // Final verification
    const finalColumns = await db('policies').columnInfo();
    console.log('✅ Final schema columns:', Object.keys(finalColumns));

  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  } finally {
    await db.destroy();
  }
}

// Run the schema fix
fixPoliciesSchema();
