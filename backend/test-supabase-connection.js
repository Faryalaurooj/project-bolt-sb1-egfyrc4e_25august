import { supabase } from './lib/supabase.js';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful!');
      console.log('Test query result:', data);
    }
  } catch (err) {
    console.error('Connection test failed:', err.message);
  }
}

testSupabaseConnection();
