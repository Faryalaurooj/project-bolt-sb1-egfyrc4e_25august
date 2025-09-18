export function up(knex) {
  return knex.schema.alterTable('emails', (table) => {
    table.jsonb('to_recipients').defaultTo('[]');
  });
}

export function down(knex) {
  return knex.schema.alterTable('emails', (table) => {
    table.dropColumn('to_recipients');
  });
}
