import { test, expect } from '../../src/fixtures/test';
import { buildBooking, type Booking } from '../../src/data/booking';

const expectBookingShape = (b: Booking) => {
  expect(b).toEqual(
    expect.objectContaining({
      firstname: expect.any(String),
      lastname: expect.any(String),
      totalprice: expect.any(Number),
      depositpaid: expect.any(Boolean),
      bookingdates: { checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
    }),
  );
};

test.describe('API: booking lifecycle', () => {
  test('create, read, update, patch and delete a booking @smoke', async ({ bookings, authToken }) => {
    const booking = buildBooking();

    const created = await bookings.create(booking);
    expect(created.status()).toBe(200);
    const { bookingid, booking: echoed } = await created.json();
    expect(bookingid).toEqual(expect.any(Number));
    expect(echoed).toEqual(booking);

    const read = await bookings.get(bookingid);
    expect(read.status()).toBe(200);
    const fetched = await read.json();
    expectBookingShape(fetched);
    expect(fetched).toEqual(booking);

    const replacement = buildBooking({ lastname: 'Updated', depositpaid: false });
    const updated = await bookings.update(bookingid, replacement, authToken);
    expect(updated.status()).toBe(200);
    expect(await updated.json()).toEqual(replacement);

    const patched = await bookings.patch(bookingid, { totalprice: 999 }, authToken);
    expect(patched.status()).toBe(200);
    expect(await patched.json()).toEqual({ ...replacement, totalprice: 999 });

    const deleted = await bookings.delete(bookingid, authToken);
    expect(deleted.status()).toBe(201);
    expect((await bookings.get(bookingid)).status()).toBe(404);
  });

  test('a new booking can be found by name @regression', async ({ bookings }) => {
    const booking = buildBooking();
    const { bookingid } = await (await bookings.create(booking)).json();

    const res = await bookings.list({ firstname: booking.firstname, lastname: booking.lastname });
    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(bookingid);
  });

  test('unknown booking id returns 404 @regression', async ({ bookings }) => {
    expect((await bookings.get(999_999_999)).status()).toBe(404);
  });
});

test.describe('API: authorisation', () => {
  let bookingid: number;
  let original: Booking;

  test.beforeEach(async ({ bookings }) => {
    original = buildBooking();
    ({ bookingid } = await (await bookings.create(original)).json());
  });

  test('update without a token is forbidden and changes nothing @regression', async ({ bookings }) => {
    const res = await bookings.update(bookingid, buildBooking({ lastname: 'Hacked' }));
    expect(res.status()).toBe(403);
    expect(await (await bookings.get(bookingid)).json()).toEqual(original);
  });

  test('delete with a forged token is forbidden @regression', async ({ bookings }) => {
    const res = await bookings.delete(bookingid, 'forged-token-123');
    expect(res.status()).toBe(403);
    expect((await bookings.get(bookingid)).status()).toBe(200);
  });

  test('patch without a token is forbidden @regression', async ({ bookings }) => {
    expect((await bookings.patch(bookingid, { totalprice: 1 })).status()).toBe(403);
  });
});
