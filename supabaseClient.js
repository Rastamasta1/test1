// Single Supabase client for the recipe collection app.
// All other modules must import { supabase } from './supabaseClient.js'
// and must NEVER call createClient again.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
