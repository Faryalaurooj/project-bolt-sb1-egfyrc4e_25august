import { db } from './db.js';

/**
 * Cleanup script to fix NULL values in policies table
 * This script will:
 * 1. Remove duplicate policies based on policy_number and contact_id
 * 2. Update NULL values where possible from raw_data
 * 3. Clean up orphaned records
 */

async function cleanupPolicies() {
  try {
    console.log('🧹 Starting policies cleanup...');

    // 1. First, let's see what we have
    const allPolicies = await db('policies').select('*');
    console.log(`📊 Found ${allPolicies.length} policies in database`);

    // 2. Find and remove duplicates based on policy_number and contact_id
    console.log('🔍 Looking for duplicate policies...');
    const duplicates = await db('policies')
      .select('policy_number', 'contact_id')
      .whereNotNull('policy_number')
      .groupBy('policy_number', 'contact_id')
      .havingRaw('count(*) > 1');

    console.log(`🔄 Found ${duplicates.length} duplicate policy groups`);

    for (const duplicate of duplicates) {
      console.log(`🗑️  Removing duplicates for policy ${duplicate.policy_number} and contact ${duplicate.contact_id}`);
      
      // Keep the most recent one, delete the rest
      const policiesToDelete = await db('policies')
        .where('policy_number', duplicate.policy_number)
        .where('contact_id', duplicate.contact_id)
        .orderBy('created_at', 'desc')
        .offset(1); // Skip the first (most recent) one

      for (const policy of policiesToDelete) {
        await db('policies').where('id', policy.id).del();
        console.log(`   ✅ Deleted policy ID: ${policy.id}`);
      }
    }

    // 3. Update NULL values from raw_data where possible
    console.log('🔄 Updating NULL values from raw_data...');
    const policiesWithRawData = await db('policies')
      .whereNotNull('raw_data')
      .where(function() {
        this.whereNull('policy_type')
            .orWhereNull('policy_entry')
            .orWhereNull('source')
            .orWhereNull('policy_agent_of_record');
      });

    for (const policy of policiesWithRawData) {
      const rawData = policy.raw_data;
      if (rawData && typeof rawData === 'object') {
        const updates = {};
        
        // Map raw_data fields to main columns
        if (rawData.policy_entry && !policy.policy_entry) {
          updates.policy_entry = rawData.policy_entry;
        }
        if (rawData.product && !policy.policy_type) {
          updates.policy_type = rawData.product;
          updates.product = rawData.product;
        }
        if (rawData.payment_plan && !policy.pfm_level) {
          updates.pfm_level = rawData.payment_plan;
          updates.payment_plan = rawData.payment_plan;
        }
        if (rawData.memo && !policy.policy_forms) {
          updates.policy_forms = rawData.memo;
          updates.memo = rawData.memo;
        }
        if (rawData.eff_date && !policy.effective_date) {
          updates.effective_date = rawData.eff_date;
          updates.eff_date = rawData.eff_date;
        }
        if (rawData.exp_date && !policy.expiration_date) {
          updates.expiration_date = rawData.exp_date;
          updates.exp_date = rawData.exp_date;
        }
        if (rawData.source && !policy.source) {
          updates.source = rawData.source;
        }
        if (rawData.sub_source && !policy.sub_source) {
          updates.sub_source = rawData.sub_source;
        }
        if (rawData.policy_agent_of_record && !policy.policy_agent_of_record) {
          updates.policy_agent_of_record = rawData.policy_agent_of_record;
        }
        if (rawData.policy_csr && !policy.policy_csr) {
          updates.policy_csr = rawData.policy_csr;
        }
        if (rawData.prior_policy_number && !policy.prior_policy_number) {
          updates.prior_policy_number = rawData.prior_policy_number;
        }
        if (rawData.payment_due_day && !policy.payment_due_day) {
          updates.payment_due_day = rawData.payment_due_day;
        }
        if (rawData.commission_split && !policy.commission_split) {
          updates.commission_split = rawData.commission_split;
        }

        if (Object.keys(updates).length > 0) {
          await db('policies')
            .where('id', policy.id)
            .update(updates);
          console.log(`   ✅ Updated policy ID: ${policy.id} with fields:`, Object.keys(updates));
        }
      }
    }

    // 4. Clean up orphaned records (policies without valid contact_id)
    console.log('🧹 Cleaning up orphaned policies...');
    const orphanedPolicies = await db('policies')
      .leftJoin('contacts', 'policies.contact_id', 'contacts.id')
      .whereNull('contacts.id')
      .select('policies.id');

    if (orphanedPolicies.length > 0) {
      console.log(`🗑️  Found ${orphanedPolicies.length} orphaned policies`);
      for (const policy of orphanedPolicies) {
        await db('policies').where('id', policy.id).del();
        console.log(`   ✅ Deleted orphaned policy ID: ${policy.id}`);
      }
    }

    // 5. Final statistics
    const finalCount = await db('policies').count('* as count').first();
    console.log(`✅ Cleanup complete! Final policy count: ${finalCount.count}`);

    // 6. Show sample of cleaned data
    const samplePolicies = await db('policies')
      .select('id', 'policy_number', 'policy_type', 'company', 'premium', 'effective_date', 'expiration_date')
      .limit(5);

    console.log('📋 Sample of cleaned policies:');
    console.table(samplePolicies);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await db.destroy();
  }
}

// Run the cleanup
cleanupPolicies();
