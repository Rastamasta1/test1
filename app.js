// Supabase client configuration module
// Loads @supabase/supabase-js from CDN — no build step required.
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://crwnrevifhskgqgtwvuu.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd25yZXZpZmhza2dxZ3R3dnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzM3MjUsImV4cCI6MjA5ODQ0OTcyNX0.nMbzRqFmpIG5CuDKUZmXbpQgczxQlzNw91tKjxYv0Xs';

// Shared Supabase client instance for the app.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
