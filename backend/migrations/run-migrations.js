import knex from 'knex';
import knexConfig from '../knexfile.js';

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    const db = knex(knexConfig.development);
    
    // Run all pending migrations
    const [batchNo, log] = await db.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ Database is already up to date');
    } else {
      console.log(`✅ Batch ${batchNo} run: ${log.length} migrations`);
      log.forEach(migration => console.log(`  - ${migration}`));
    }
    
    await db.destroy();
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}
