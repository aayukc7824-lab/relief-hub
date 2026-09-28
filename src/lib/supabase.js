import { createClient } from '@supabase/supabase-js';

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonymousKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
const backendEnabled = import.meta.env.VITE_BACKEND_READY === 'true';

const backendReady = Boolean(
  projectUrl
    && anonymousKey
    && turnstileSiteKey
    && backendEnabled
    && !projectUrl.includes('YOUR_PROJECT')
    && !anonymousKey.includes('YOUR_PUBLIC_ANON_KEY')
    && !turnstileSiteKey.includes('YOUR_TURNSTILE_SITE_KEY'),
);

export const supabase = backendReady
  ? createClient(projectUrl, anonymousKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export { backendReady };
export { turnstileSiteKey };
