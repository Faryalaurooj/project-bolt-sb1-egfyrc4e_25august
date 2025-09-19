import { supabase } from './lib/supabase.js';

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
    const { data: allPolicies, error: allPoliciesError } = await supabase
      .from('policies')
      .select('*');
    
    if (allPoliciesError) {
      console.error('❌ Error fetching policies:', allPoliciesError);
      return;
    }
    
    console.log(`📊 Found ${allPolicies.length} policies in database`);

    // 2. Find and remove duplicates based on policy_number and contact_id
    console.log('🔍 Looking for duplicate policies...');
    
    // Get all policies with policy_number and contact_id
    const { data: policiesWithNumbers, error: policiesError } = await supabase
      .from('policies')
      .select('id, policy_number, contact_id, created_at')
      .not('policy_number', 'is', null);
    
    if (policiesError) {
      console.error('❌ Error fetching policies with numbers:', policiesError);
      return;
    }

    // Group by policy_number and contact_id to find duplicates
    const groupedPolicies = {};
    policiesWithNumbers.forEach(policy => {
      const key = `${policy.policy_number}-${policy.contact_id}`;
      if (!groupedPolicies[key]) {
        groupedPolicies[key] = [];
      }
      groupedPolicies[key].push(policy);
    });

    const duplicates = Object.values(groupedPolicies).filter(group => group.length > 1);
    console.log(`🔄 Found ${duplicates.length} duplicate policy groups`);

    for (const duplicateGroup of duplicates) {
      console.log(`🗑️  Removing duplicates for policy ${duplicateGroup[0].policy_number} and contact ${duplicateGroup[0].contact_id}`);
      
      // Sort by created_at (most recent first) and keep the first one
      const sortedPolicies = duplicateGroup.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const policiesToDelete = sortedPolicies.slice(1); // Remove all except the first (most recent)

      for (const policy of policiesToDelete) {
        const { error: deleteError } = await supabase
          .from('policies')
          .delete()
          .eq('id', policy.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting policy ${policy.id}:`, deleteError);
        } else {
          console.log(`   ✅ Deleted policy ID: ${policy.id}`);
        }
      }
    }

    // 3. Update NULL values from raw_data where possible
    console.log('🔄 Updating NULL values from raw_data...');
    const { data: policiesWithRawData, error: rawDataError } = await supabase
      .from('policies')
      .select('*')
      .not('raw_data', 'is', null)
      .or('policy_type.is.null,policy_entry.is.null,source.is.null,policy_agent_of_record.is.null');

    if (rawDataError) {
      console.error('❌ Error fetching policies with raw data:', rawDataError);
      return;
    }

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
          const { error: updateError } = await supabase
            .from('policies')
            .update(updates)
            .eq('id', policy.id);
          
          if (updateError) {
            console.error(`❌ Error updating policy ${policy.id}:`, updateError);
          } else {
            console.log(`   ✅ Updated policy ID: ${policy.id} with fields:`, Object.keys(updates));
          }
        }
      }
    }

    // 4. Clean up orphaned records (policies without valid contact_id)
    console.log('🧹 Cleaning up orphaned policies...');
    
    // Get all policies
    const { data: allPoliciesForCleanup, error: allPoliciesError2 } = await supabase
      .from('policies')
      .select('id, contact_id');
    
    if (allPoliciesError2) {
      console.error('❌ Error fetching policies for cleanup:', allPoliciesError2);
      return;
    }

    // Get all contact IDs
    const { data: allContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id');
    
    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError);
      return;
    }

    const contactIds = new Set(allContacts.map(contact => contact.id));
    const orphanedPolicies = allPoliciesForCleanup.filter(policy => 
      policy.contact_id && !contactIds.has(policy.contact_id)
    );

    if (orphanedPolicies.length > 0) {
      console.log(`🗑️  Found ${orphanedPolicies.length} orphaned policies`);
      for (const policy of orphanedPolicies) {
        const { error: deleteError } = await supabase
          .from('policies')
          .delete()
          .eq('id', policy.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting orphaned policy ${policy.id}:`, deleteError);
        } else {
          console.log(`   ✅ Deleted orphaned policy ID: ${policy.id}`);
        }
      }
    }

    // 5. Final statistics
    const { count: finalCount, error: countError } = await supabase
      .from('policies')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting final count:', countError);
    } else {
      console.log(`✅ Cleanup complete! Final policy count: ${finalCount}`);
    }

    // 6. Show sample of cleaned data
    const { data: samplePolicies, error: sampleError } = await supabase
      .from('policies')
      .select('id, policy_number, policy_type, company, premium, effective_date, expiration_date')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error fetching sample policies:', sampleError);
    } else {
      console.log('📋 Sample of cleaned policies:');
      console.table(samplePolicies);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupPolicies();