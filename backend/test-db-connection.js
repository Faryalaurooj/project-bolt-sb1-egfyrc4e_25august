import dotenv from 'dotenv';
import { Client } from 'pg';
import knexfile from './knexfile.js';

dotenv.config(); // Load environment variables from .env

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];
console.log("process.env.DB_PASSWORD", process.env.DB_PASSWORD);

const dbConfig = config.connection.connectionString ? {
  connectionString: config.connection.connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
} : {
  host: config.connection.host,
  port: config.connection.port,
  user: config.connection.user,
  password: process.env.DB_PASSWORD || config.connection.password,
  database: config.connection.database,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
};

const client = new Client(dbConfig);

async function testDbConnection() {
  try {
    console.log('Attempting to connect to the database...');
    
    // Create a timeout promise
    const timeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timed out after 10 seconds'));
      }, 10000);
    });

    // Race between the connection attempt and timeout
    await Promise.race([
      client.connect(),
      timeout
    ]);

    // Test the connection with a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Successfully connected to the database!');
    console.log('Current database time:', result.rows[0].now);

  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    console.error('Connection details used:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      // Do not log password
    });
  } finally {
    try {
      await client.end();
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Error closing connection:', err.message);
    }
  }
}

testDbConnection();