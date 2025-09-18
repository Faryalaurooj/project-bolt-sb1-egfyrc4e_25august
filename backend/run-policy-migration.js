const knex = require('knex');
const config = require('./knexfile.js');

const db = knex(config.development);

async function runMigration() {
  try {
    console.log('🔄 Running policy table migration...');
    
    // Check if policies table already exists
    const hasTable = await db.schema.hasTable('policies');
    if (hasTable) {
      console.log('⚠️  Policies table already exists, skipping migration');
      return;
    }

    // Run the migration
    await db.migrate.latest();
    console.log('✅ Policy table migration completed successfully');
    
    // Verify the table was created
    const tableInfo = await db('policies').columnInfo();
    console.log('📋 Policy table structure:', Object.keys(tableInfo));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await db.destroy();
  }
}

runMigration();
