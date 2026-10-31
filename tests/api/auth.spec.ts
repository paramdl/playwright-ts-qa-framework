import { test, expect } from '../../src/fixtures/test';

test.describe('API: auth', () => {
  test('valid credentials return a token @smoke', async ({ bookings }) => {
    const res = await bookings.createToken();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toMatch(/^[a-z0-9]{10,}$/i);
  });

  test('bad credentials are refused without a token @regression', async ({ bookings }) => {
    const res = await bookings.createToken('admin', 'not-the-password');
    // The demo API answers 200 with a reason instead of 401; assert what matters: no token.
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });

  test('health check responds @smoke', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });
});
