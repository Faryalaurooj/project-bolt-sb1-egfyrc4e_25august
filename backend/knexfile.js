// export default {
//   development: {
//     client: 'pg',
//     connection: {
//       host: 'db.zdcjwzvzfvlumipbbjzp.supabase.co',
//       port: 5432,
//       user: 'postgres',
//       password: "0Ck8HI4u2L4gfzwG",
//       database: 'postgres',
//        ssl: { rejectUnauthorized: false }
//     },
//     pool: {
//       min: 2,
//       max: 10,
//       acquireTimeoutMillis: 60000,
//       createTimeoutMillis: 30000,
//       idleTimeoutMillis: 30000,
//       reapIntervalMillis: 1000,
//       createRetryIntervalMillis: 100
//     },
//     migrations: {
//       directory: './migrations'
//     },
//     seeds: {
//       directory: './seeds'
//     }
//   }
// };
export default {
  development: {
    client: 'pg',
    connection: {
      host: 'zdcjwzvzfvlumipbbjzp.supabase.co',
      port: 5432,
      user: 'postgres',
      password: '0Ck8HI4u2L4gfzwG',
      database: 'postgres',
      ssl: { rejectUnauthorized: false }   // ✅ required for Supabase
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
