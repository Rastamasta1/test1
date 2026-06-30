const request = require('supertest');

// Mock the supabase client module before app is required.
jest.mock('../src/db/supabaseClient', () => {
  const { createMockSupabase } = require('./helpers/mockSupabase');
  return createMockSupabase().client;
});

const app = require('../src/app');

describe('GET /health', () => {
  it('returns 200 and a status payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  it('returns JSON content type', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('unknown routes', () => {
  it('returns a 404 for an unmapped path', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
  });
});
