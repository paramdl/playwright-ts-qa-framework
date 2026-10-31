import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from '../data/booking';

/** Thin client for https://restful-booker.herokuapp.com (public demo credentials). */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  createToken(username = 'admin', password = 'password123'): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  async token(): Promise<string> {
    const body = await (await this.createToken()).json();
    return body.token;
  }

  create(booking: Booking) {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  list(filters: Record<string, string> = {}) {
    return this.request.get('/booking', { params: filters });
  }

  update(id: number, booking: Booking, token?: string) {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.auth(token) });
  }

  patch(id: number, fields: Partial<Booking>, token?: string) {
    return this.request.patch(`/booking/${id}`, { data: fields, headers: this.auth(token) });
  }

  delete(id: number, token?: string) {
    return this.request.delete(`/booking/${id}`, { headers: this.auth(token) });
  }

  private auth(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}
