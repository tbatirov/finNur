import { createClient } from '@supabase/supabase-js';
import { validateEnvironmentVariables } from '../utils/validation';

// Validate environment variables before using them
validateEnvironmentVariables(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-client-info': 'finnur-web',
    },
  },
});