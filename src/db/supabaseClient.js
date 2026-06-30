const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

/**
 * Create a Supabase client. Pass a user access token to operate under that
 * user's RLS context, or omit to use the service role (admin) key.
 */
function createUserClient(accessToken) {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function createServiceClient() {
  if (!config.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

module.exports = { createUserClient, createServiceClient };
