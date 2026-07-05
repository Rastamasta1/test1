// Single Supabase client for the feedback wall app
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://crwnrevifhskgqgtwvuu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd25yZXZpZmhza2dxZ3R3dnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzM3MjUsImV4cCI6MjA5ODQ0OTcyNX0.nMbzRqFmpIG5CuDKUZmXbpQgczxQlzNw91tKjxYv0Xs'
);
