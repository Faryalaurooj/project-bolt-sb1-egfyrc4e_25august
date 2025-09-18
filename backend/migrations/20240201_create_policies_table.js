export function up(knex) {
  return knex.schema.createTable('policies', function(table) {
    table.increments('id').primary();
    table.string('policy_entry').notNullable().defaultTo('New Business');
    table.string('company').nullable();
    table.string('product').nullable();
    table.string('payment_plan').nullable();
    table.string('policy_number').notNullable();
    table.decimal('premium', 10, 2).nullable();
    table.integer('payment_due_day').nullable();
    table.date('eff_date').nullable();
    table.date('exp_date').nullable();
    table.string('source').nullable();
    table.string('sub_source').nullable();
    table.string('policy_agent_of_record').nullable();
    table.string('policy_csr').nullable();
    table.string('prior_policy_number').nullable();
    table.text('memo').nullable();
    table.string('commission_split').defaultTo('100.00%');
    table.integer('contact_id').unsigned().nullable();
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('contact_id').references('id').inTable('contacts').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes
    table.index('policy_number');
    table.index('contact_id');
    table.index('created_by');
  });
};

export function down(knex) {
  return knex.schema.dropTable('policies');
};
