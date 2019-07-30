const request = require('supertest');
const index = require('./index')

describe('/', () => {
  test('GET responds with success code', async () => {
    const response = await request(index).get('/');
    expect(response.statusCode).toBe(200);
  });
});