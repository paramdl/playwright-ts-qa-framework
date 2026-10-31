export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

const isoDate = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

/** Unique-enough booking so parallel runs on the shared demo API don't collide. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const tag = Math.random().toString(36).slice(2, 8);
  return {
    firstname: `QA-${tag}`,
    lastname: 'Automation',
    totalprice: 100 + Math.floor(Math.random() * 900),
    depositpaid: true,
    bookingdates: { checkin: isoDate(7), checkout: isoDate(10) },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
