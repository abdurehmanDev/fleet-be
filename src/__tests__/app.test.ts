import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('GET /api/v1/health should return 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('uptime');
  });
});

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test@123456',
    full_name: 'Test User',
    role: 'OWNER',
  };

  it('POST /api/v1/auth/register - should validate input', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'invalid', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login - should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });
});

describe('Protected Routes', () => {
  it('GET /api/v1/drivers - should require auth', async () => {
    const res = await request(app).get('/api/v1/drivers');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/vehicles - should require auth', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/weekly-earnings - should require auth', async () => {
    const res = await request(app).get('/api/v1/weekly-earnings');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/notifications - should require auth', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
  });
});
