import knex from 'knex';
import config from './knexfile.js';

const db = knex(config.development);

async function runMigration() {
  try {
    console.log('🔄 Running personal information fields migration...');
    
    // Check if contacts table exists
    const hasTable = await db.schema.hasTable('contacts');
    if (!hasTable) {
      console.log('❌ Contacts table does not exist, please create it first');
      return;
    }

    // Check if fields already exist
    const tableInfo = await db('contacts').columnInfo();
    const existingFields = Object.keys(tableInfo);
    
    if (existingFields.includes('first_name')) {
      console.log('⚠️  Personal information fields already exist, skipping migration');
      return;
    }

    // Run the migration
    await db.migrate.latest();
    console.log('✅ Personal information fields migration completed successfully');
    
    // Verify the fields were added
    const newTableInfo = await db('contacts').columnInfo();
    const newFields = Object.keys(newTableInfo);
    const addedFields = newFields.filter(field => !existingFields.includes(field));
    
    console.log('📋 Added fields:', addedFields);
    console.log('📊 Total fields in contacts table:', newFields.length);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await db.destroy();
  }
}

runMigration();
