import { test, expect } from '../../src/fixtures/test';
import { buildBooking } from '../../src/data/booking';

/**
 * Input validation on POST /booking. The public demo is lenient in places, so these tests pin down
 * the behaviour that should never regress (missing required data must not create a booking).
 */
test.describe('API: input validation', () => {
  test('missing required fields are rejected @regression', async ({ request }) => {
    const { firstname, ...withoutFirstname } = buildBooking();
    const res = await request.post('/booking', { data: withoutFirstname });
    expect(res.status(), `created a booking without firstname (${firstname})`).toBeGreaterThanOrEqual(400);
  });

  test('empty body is rejected @regression', async ({ request }) => {
    const res = await request.post('/booking', { data: {} });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('malformed JSON is rejected @regression', async ({ request }) => {
    const res = await request.post('/booking', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"firstname": "broken",',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
