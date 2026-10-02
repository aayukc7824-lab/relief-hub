import { createClient } from '@supabase/supabase-js';

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonymousKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const portfolioSupabase = projectUrl && anonymousKey
  && !projectUrl.includes('YOUR_PROJECT')
  && !anonymousKey.includes('YOUR_PUBLIC_ANON_KEY')
  ? createClient(projectUrl, anonymousKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'relief-hub-portfolio-auth',
      },
    })
  : null;
