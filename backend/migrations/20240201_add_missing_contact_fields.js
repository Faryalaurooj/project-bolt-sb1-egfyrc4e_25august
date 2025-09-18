export function up(knex) {
  return knex.schema.alterTable('contacts', function(table) {
    // Check and add missing columns only
    const columnsToAdd = [
      { name: 'date_licensed', type: 'date', nullable: true },
      { name: 'drivers_license', type: 'string', nullable: true },
      { name: 'dl_state', type: 'string', nullable: true },
      { name: 'preferred_contact_method', type: 'string', nullable: true },
      { name: 'do_not_email', type: 'boolean', default: false },
      { name: 'do_not_text', type: 'boolean', default: false },
      { name: 'do_not_call', type: 'boolean', default: false },
      { name: 'do_not_mail', type: 'boolean', default: false },
      { name: 'do_not_market', type: 'boolean', default: false },
      { name: 'do_not_capture_email', type: 'boolean', default: false },
      { name: 'mailing_address', type: 'string', nullable: true },
      { name: 'mailing_city', type: 'string', nullable: true },
      { name: 'mailing_state', type: 'string', nullable: true },
      { name: 'mailing_zip', type: 'string', nullable: true },
      { name: 'customer_type', type: 'string', default: 'Individual' },
      { name: 'account_type', type: 'string', default: 'Standard' },
      { name: 'contact_status', type: 'string', default: 'Active' },
      { name: 'customer_sub_status', type: 'string', nullable: true },
      { name: 'customer_agent_of_record', type: 'string', nullable: true },
      { name: 'customer_csr', type: 'string', nullable: true },
      { name: 'keyed_by', type: 'string', nullable: true },
      { name: 'source', type: 'string', nullable: true },
      { name: 'company_name', type: 'string', nullable: true },
      { name: 'relationship_type', type: 'string', default: 'employee' }
    ];

    // Add columns one by one to avoid conflicts
    return Promise.all(columnsToAdd.map(column => {
      return knex.schema.hasColumn('contacts', column.name).then(exists => {
        if (!exists) {
          if (column.type === 'date') {
            return table.date(column.name).nullable();
          } else if (column.type === 'boolean') {
            return table.boolean(column.name).defaultTo(column.default);
          } else {
            return table.string(column.name).nullable();
          }
        }
      });
    }));
  });
}

export function down(knex) {
  return knex.schema.alterTable('contacts', function(table) {
    const columnsToDrop = [
      'date_licensed', 'drivers_license', 'dl_state', 'preferred_contact_method',
      'do_not_email', 'do_not_text', 'do_not_call', 'do_not_mail', 'do_not_market',
      'do_not_capture_email', 'mailing_address', 'mailing_city', 'mailing_state',
      'mailing_zip', 'customer_type', 'account_type', 'contact_status',
      'customer_sub_status', 'customer_agent_of_record', 'customer_csr',
      'keyed_by', 'source', 'company_name', 'relationship_type'
    ];

    return Promise.all(columnsToDrop.map(column => {
      return knex.schema.hasColumn('contacts', column).then(exists => {
        if (exists) {
          return table.dropColumn(column);
        }
      });
    }));
  });
}
