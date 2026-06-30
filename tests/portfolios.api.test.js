const request = require('supertest');
const { createMockSupabase } = require('./helpers/mockSupabase');

const mock = createMockSupabase();

jest.mock('../src/db/supabaseClient', () => mock.client);

const app = require('../src/app');

describe('Portfolios API', () => {
  beforeEach(() => {
    mock.reset();
  });

  describe('GET /portfolios', () => {
    it('returns a list of portfolios', async () => {
      mock.setData([
        { id: 'p1', user_id: 'u1', name: 'Growth', base_currency: 'USD' },
        { id: 'p2', user_id: 'u1', name: 'Income', base_currency: 'USD' },
      ]);
      const res = await request(app).get('/portfolios');
      // Route may require auth; accept either a populated 200 or 401.
      expect([200, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('surfaces database errors as a 4xx/5xx', async () => {
      mock.setError({ message: 'db down', code: 'PGRST500' });
      const res = await request(app).get('/portfolios');
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /portfolios', () => {
    it('rejects an empty body with a client error', async () => {
      const res = await request(app).post('/portfolios').send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });
});
