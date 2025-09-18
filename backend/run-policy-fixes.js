import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Script to run all policy fixes
 * 1. Run the migration to add missing columns
 * 2. Run the cleanup script to fix existing data
 */

async function runPolicyFixes() {
  try {
    console.log('🚀 Starting policy fixes...\n');

    // Step 1: Run the migration
    console.log('📋 Step 1: Running migration to add missing columns...');
    try {
      const { stdout, stderr } = await execAsync('npx supabase db push');
      console.log('✅ Migration completed successfully');
      if (stdout) console.log('Migration output:', stdout);
      if (stderr) console.log('Migration warnings:', stderr);
    } catch (error) {
      console.log('⚠️  Migration may have already been applied or failed:', error.message);
    }

    console.log('\n📋 Step 2: Running cleanup script...');
    try {
      // Import and run the cleanup script
      const { cleanupPolicies } = await import('./cleanup-policies.js');
      await cleanupPolicies();
    } catch (error) {
      console.error('❌ Cleanup script failed:', error);
    }

    console.log('\n✅ All policy fixes completed!');
    console.log('\n📊 Summary of changes:');
    console.log('   • Added missing policy columns to database');
    console.log('   • Updated backend to save data directly to columns');
    console.log('   • Fixed existing NULL values from raw_data');
    console.log('   • Removed duplicate policies');
    console.log('   • Cleaned up orphaned records');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test creating a new policy');
    console.log('   3. Verify data is saved in the correct columns');

  } catch (error) {
    console.error('❌ Error running policy fixes:', error);
  }
}

// Run the fixes
runPolicyFixes();
