require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3000'), 10),
  appName: optional('APP_NAME', 'my-app'),
  appUrl: optional('APP_URL', 'http://localhost:3000'),
  supabase: {
    url: required('SUPABASE_URL'),
    anonKey: required('SUPABASE_ANON_KEY'),
    serviceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY', ''),
  },
  databaseUrl: optional('DATABASE_URL', ''),
  jwtSecret: required('JWT_SECRET'),
  sessionSecret: optional('SESSION_SECRET', ''),
  logLevel: optional('LOG_LEVEL', 'info'),
  isProduction: optional('NODE_ENV', 'development') === 'production',
};

module.exports = config;
