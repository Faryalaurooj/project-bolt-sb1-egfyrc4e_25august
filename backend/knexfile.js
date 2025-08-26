export default {
  development: {
    client: 'pg',
    connection: {
      host: 'db.zdcjwzvzfvlumipbbjzp.supabase.co',
      port: 5432,
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'postgres'
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};