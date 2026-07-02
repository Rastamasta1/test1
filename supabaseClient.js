// Single shared Supabase client for the whole app.
// All other modules (e.g. app.js) MUST import { supabase } from './supabaseClient.js'.
// Never call createClient again anywhere else.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
