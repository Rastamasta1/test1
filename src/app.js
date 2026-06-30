require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

const env = optional('NODE_ENV', 'development');
const isTest = env === 'test';

const config = {
  env,
  port: parseInt(optional('PORT', '3000'), 10),
  appName: optional('APP_NAME', 'my-app'),
  appUrl: optional('APP_URL', 'http://localhost:3000'),
  supabase: {
    url: required('SUPABASE_URL', isTest ? 'http://localhost:54321' : undefined),
    anonKey: required('SUPABASE_ANON_KEY', isTest ? 'test-anon-key' : undefined),
    serviceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY', ''),
  },
  databaseUrl: optional('DATABASE_URL', ''),
  jwtSecret: required('JWT_SECRET', isTest ? 'test-jwt-secret' : undefined),
  sessionSecret: optional('SESSION_SECRET', ''),
  logLevel: optional('LOG_LEVEL', 'info'),
  isProduction: env === 'production',
};

module.exports = config;
