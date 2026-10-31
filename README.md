# Playwright + TypeScript QA Framework

[![tests](https://github.com/paramdl/playwright-ts-qa-framework/actions/workflows/tests.yml/badge.svg)](https://github.com/paramdl/playwright-ts-qa-framework/actions/workflows/tests.yml)

UI and API test automation for two public demo apps, built the way I structure suites for real products:
page objects, typed API clients, shared fixtures, tagged smoke/regression runs, cross-browser projects
and CI on every push.

| App | Type | What's covered |
|---|---|---|
| [Sauce Demo](https://www.saucedemo.com) | Web UI | Login (valid, locked-out, invalid, data-driven), session reuse, product sorting, cart, checkout with totals and tax maths, form validation, accessibility (axe), known-defect tracking |
| [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | REST API | Token auth, full booking CRUD, search, 404s, authorisation (no token / forged token), input validation |

**57 tests** across Chromium, WebKit and the API project.

## Highlights
- **Page Object Model** in [`src/pages`](src/pages) with `data-test` locators (`testIdAttribute`), no CSS chains.
- **Typed API client** in [`src/api/BookingClient.ts`](src/api/BookingClient.ts), shared with UI tests through one fixture file.
- **Log in once:** a `setup` project saves the session; UI projects reuse it via `storageState`.
- **Security-minded checks:** no user enumeration on login, protected pages redirect when logged out, write operations refuse missing or forged tokens and leave data unchanged.
- **Money maths verified,** not just displayed: subtotal = sum of item prices, tax = 8%, total = subtotal + tax.
- **Known defects as code:** [`known-defects.spec.ts`](tests/ui/known-defects.spec.ts) describes correct behaviour with `test.fail()`. It stays green while the bug exists and turns red the day it's fixed.
- **Accessibility gate:** axe (WCAG 2 A/AA) on key pages; full results attached to the report, build fails on new critical/serious issues.
- **Test data factory** ([`src/data/booking.ts`](src/data/booking.ts)) builds unique bookings so parallel runs on a shared API don't collide.
- **CI:** GitHub Actions matrix (api / ui-chromium / ui-webkit), type check, retries on CI only, HTML + JUnit reports uploaded as artifacts, scheduled weekday run to catch drift.

## Structure
```
src/
  api/BookingClient.ts      typed REST client
  data/                     users, test-data factories
  fixtures/test.ts          page objects + API client as Playwright fixtures
  pages/                    Login, Inventory, Cart, Checkout page objects
tests/
  setup/auth.setup.ts       logs in once, saves storage state
  ui/                       login, inventory, checkout, accessibility, known defects
  api/                      auth, booking lifecycle + authorisation, validation
```

## Run it
```bash
npm ci
npx playwright install chromium webkit
npm test                 # everything
npm run test:smoke       # @smoke only
npm run test:api         # API only, no browser
npm run test:ui          # Chromium + WebKit
npm run report           # open the HTML report
```
Point at another environment with `UI_BASE_URL` / `API_BASE_URL`.

## Notes
- Both apps are public practice targets; the credentials in the code are the ones they publish.
- Restful Booker is shared and resets itself periodically, so tests create their own data instead of relying on fixed IDs.

---
Prashanth DL · Senior Test Engineer · [LinkedIn](https://www.linkedin.com/in/prashanth-dl-75617b244)
