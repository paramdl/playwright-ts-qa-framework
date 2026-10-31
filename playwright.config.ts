import { defineConfig, devices } from '@playwright/test';

export const UI_BASE_URL = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';
export const STANDARD_USER_STATE = 'playwright/.auth/standard_user.json';

/**
 * Projects:
 *   setup        - logs in once as standard_user and saves the session
 *   ui-chromium  - UI tests in Chromium, reusing that session
 *   ui-firefox   - the same UI tests in Firefox
 *   api          - pure request-context tests, no browser
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],

  use: {
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: 'setup/*.setup.ts',
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL },
    },
    {
      name: 'ui-chromium',
      testMatch: 'ui/**/*.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL, storageState: STANDARD_USER_STATE },
    },
    {
      name: 'ui-webkit',
      testMatch: 'ui/**/*.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], baseURL: UI_BASE_URL, storageState: STANDARD_USER_STATE },
    },
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: { baseURL: API_BASE_URL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});
