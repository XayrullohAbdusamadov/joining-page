import { createClient } from '@supabase/supabase-js';

const cleanEnvVar = (val: string) => {
  let s = (val || '').trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.substring(1, s.length - 1);
  }
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.substring(1, s.length - 1);
  }
  return s.trim();
}

const supabaseUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
const supabaseAnonKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

// Safe helper to check if a URL is structurally valid HTTP/HTTPS
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Only consider Supabase configured if both values exist AND the URL is valid
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl)
);

// Use a fallback placeholder if the configured URL is invalid to prevent application crash during startup/build
const finalUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project-id.supabase.co';
const finalKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(finalUrl, finalKey);
