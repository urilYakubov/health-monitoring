const request = require('supertest');
const app = require('../src/app');

describe('Clinical Profile API', () => {

  test('GET /clinical-profile should return 401 without token', async () => {
    const res = await request(app).get('/clinical-profile');

    expect(res.statusCode).toBe(401);
  });

});