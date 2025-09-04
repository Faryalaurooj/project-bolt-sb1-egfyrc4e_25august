#!/usr/bin/env node

/**
 * GoTo Connect Credentials Setup Script
 * 
 * This script helps you set up your GoTo Connect API credentials.
 * Run this script to configure your GOTO_APP and GOTO_CONNECT environment variables.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 GoTo Connect Credentials Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  
  // Read existing .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if GoTo credentials are already set
  const hasGotoApp = envContent.includes('GOTO_APP=');
  const hasGotoConnect = envContent.includes('GOTO_CONNECT=');
  
  if (hasGotoApp && hasGotoConnect) {
    console.log('✅ GoTo Connect credentials are already configured');
    console.log('📝 Current configuration:');
    
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.startsWith('GOTO_APP=') || line.startsWith('GOTO_CONNECT=')) {
        const [key, value] = line.split('=');
        const maskedValue = value ? `${value.substring(0, 8)}...` : 'Not set';
        console.log(`   ${key}=${maskedValue}`);
      }
    });
  } else {
    console.log('⚠️  GoTo Connect credentials are not fully configured');
    console.log('📝 Please add the following to your .env file:');
    console.log('');
    console.log('GOTO_APP=your_goto_app_key_here');
    console.log('GOTO_CONNECT=your_goto_connect_key_here');
    console.log('');
  }
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env file with GoTo Connect credentials template...');
  
  const envTemplate = `# GoTo Connect API Credentials
GOTO_APP=your_goto_app_key_here
GOTO_CONNECT=your_goto_connect_key_here

# Database Configuration (update these with your actual values)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_database
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=5000
NODE_ENV=development
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created');
  console.log('📝 Please update the GOTO_APP and GOTO_CONNECT values with your actual credentials');
}

console.log('\n🔧 Next Steps:');
console.log('1. Update your .env file with your actual GoTo Connect credentials');
console.log('2. Restart your backend server: npm run dev');
console.log('3. Test the GoTo Connect integration in your frontend');
console.log('\n📚 GoTo Connect API Documentation:');
console.log('   https://developer.goto.com/');
console.log('\n🚀 Ready to make calls!');
