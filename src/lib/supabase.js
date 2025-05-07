import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gllyijezpwwryxgetfxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbHlpamV6cHd3cnl4Z2V0ZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTQ1NzMsImV4cCI6MjA2MjAzMDU3M30.GuwQicd94Ayw1EGbENDiAef1RfERAxPWYuzBMG7fxzE';

// Create the Supabase client with additional options for better error handling and logging
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  // Enable debug logs in development
  debug: process.env.NODE_ENV === 'development'
});

// For debugging purposes - log connection status when module is first imported
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client initialized with URL:', supabaseUrl);
  
  // Test the connection
  (async () => {
    try {
      const { data, error } = await supabase.from('prompts').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test error:', error);
      } else {
        console.log('Supabase connection successful');
      }
    } catch (e) {
      console.error('Error testing Supabase connection:', e);
    }
  })();
} 