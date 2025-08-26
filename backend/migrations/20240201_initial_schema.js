export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('first_name');
      table.string('last_name');
      table.string('contact_number');
      table.string('role').defaultTo('user');
      table.timestamps(true, true);
    })
    .createTable('contacts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email');
      table.string('phone');
      table.string('address');
      table.string('city');
      table.string('state');
      table.string('zip');
      table.text('notes');
      table.specificType('tags', 'text[]');
      table.string('keep_in_touch_interval');
      table.timestamp('last_contacted_at').defaultTo(knex.fn.now());
      table.string('spouse_first_name');
      table.string('spouse_last_name');
      table.string('spouse_email');
      table.string('spouse_phone');
      table.date('spouse_date_of_birth');
      table.boolean('do_not_contact').defaultTo(false);
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('household_members', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('contact_id').references('id').inTable('contacts').onDelete('CASCADE');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('relationship').notNullable();
      table.date('date_of_birth');
      table.string('email');
      table.string('phone');
      table.text('notes');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('notes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('content');
      table.string('visibility').defaultTo('all employees');
      table.uuid('contact_id').references('id').inTable('contacts').onDelete('CASCADE');
      table.uuid('created_by').references('id').inTable('users');
      table.boolean('is_action_item').defaultTo(false);
      table.string('status').defaultTo('pending');
      table.boolean('is_sticky').defaultTo(false);
      table.integer('x_position').defaultTo(100);
      table.integer('y_position').defaultTo(100);
      table.string('media_url');
      table.timestamps(true, true);
    })
    .createTable('phone_calls', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('content');
      table.string('visibility').defaultTo('all employees');
      table.uuid('contact_id').references('id').inTable('contacts').onDelete('CASCADE');
      table.uuid('created_by').references('id').inTable('users');
      table.boolean('is_action_item').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('text_campaigns', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('message').notNullable();
      table.string('status').defaultTo('draft');
      table.timestamp('scheduled_at');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('text_campaign_recipients', (table) => {
      table.uuid('campaign_id').references('id').inTable('text_campaigns').onDelete('CASCADE');
      table.uuid('contact_id').references('id').inTable('contacts').onDelete('CASCADE');
      table.primary(['campaign_id', 'contact_id']);
    })
    .createTable('email_templates', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.string('subject');
      table.text('content');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('email_signatures', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('content');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('social_media_posts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.text('content').notNullable();
      table.specificType('platforms', 'text[]');
      table.string('media_url');
      table.timestamp('scheduled_at');
      table.string('status').defaultTo('draft');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('card_templates', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('image_url');
      table.string('category');
      table.string('industry');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })
    .createTable('calendar_events', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').references('id').inTable('users');
      table.string('event_text').notNullable();
      table.date('event_date').notNullable();
      table.string('color');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('text_messages', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('sender_id').references('id').inTable('users');
      table.uuid('recipient_id').references('id').inTable('users');
      table.text('message_text');
      table.string('media_url');
      table.timestamps(true, true);
    })
    .createTable('tasks', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('description');
      table.uuid('assigned_to').references('id').inTable('users');
      table.string('status').defaultTo('pending');
      table.date('due_date');
      table.timestamps(true, true);
    })
    .createTable('leads', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('contact_id').references('id').inTable('contacts');
      table.string('status').defaultTo('new');
      table.decimal('value');
      table.string('source');
      table.timestamps(true, true);
    })
    .createTable('emails', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('contact_id').references('id').inTable('contacts');
      table.string('subject');
      table.text('body');
      table.string('status').defaultTo('sent');
      table.timestamp('sent_at');
      table.timestamps(true, true);
    })
    .createTable('texts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('contact_id').references('id').inTable('contacts');
      table.string('message');
      table.string('status').defaultTo('sent');
      table.timestamp('sent_at');
      table.timestamps(true, true);
    })
    .createTable('touchpoints', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('contact_id').references('id').inTable('contacts');
      table.enum('type', ['email', 'text', 'call', 'meeting']);
      table.text('notes');
      table.timestamp('occurred_at').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists('touchpoints')
    .dropTableIfExists('texts')
    .dropTableIfExists('emails')
    .dropTableIfExists('leads')
    .dropTableIfExists('tasks')
    .dropTableIfExists('text_messages')
    .dropTableIfExists('calendar_events')
    .dropTableIfExists('card_templates')
    .dropTableIfExists('social_media_posts')
    .dropTableIfExists('email_signatures')
    .dropTableIfExists('email_templates')
    .dropTableIfExists('text_campaign_recipients')
    .dropTableIfExists('text_campaigns')
    .dropTableIfExists('phone_calls')
    .dropTableIfExists('notes')
    .dropTableIfExists('household_members')
    .dropTableIfExists('contacts')
    .dropTableIfExists('users');
}