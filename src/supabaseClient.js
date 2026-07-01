import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const SUPABASE_URL = 'https://crwnrevifhskgqgtwvuu.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd25yZXZpZmhza2dxZ3R3dnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzM3MjUsImV4cCI6MjA5ODQ0OTcyNX0.nMbzRqFmpIG5CuDKUZmXbpQgczxQlzNw91tKjxYv0Xs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
