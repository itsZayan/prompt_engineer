import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gllyijezpwwryxgetfxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbHlpamV6cHd3cnl4Z2V0ZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTQ1NzMsImV4cCI6MjA2MjAzMDU3M30.GuwQicd94Ayw1EGbENDiAef1RfERAxPWYuzBMG7fxzE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 