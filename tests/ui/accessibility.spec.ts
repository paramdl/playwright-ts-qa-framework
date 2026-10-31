import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';

const SEVERE = new Set(['critical', 'serious']);

/** Severe violations already accepted on each page. A new one fails the test; a fixed one does too, prompting a baseline update. */
const KNOWN_A11Y: Record<string, string[]> = {};

test.describe('Accessibility (axe, WCAG 2 A/AA)', () => {
  const pages = [
    { name: 'login', path: '/', loggedOut: true },
    { name: 'inventory', path: '/inventory.html', loggedOut: false },
  ];

  for (const p of pages) {
    test(`${p.name} page has no new severe violations @regression`, async ({ page, browser }, testInfo) => {
      const context = p.loggedOut ? await browser.newContext({ storageState: { cookies: [], origins: [] } }) : null;
      const target = context ? await context.newPage() : page;
      try {
        await target.goto(p.path);
        const results = await new AxeBuilder({ page: target }).withTags(['wcag2a', 'wcag2aa']).analyze();
        await testInfo.attach(`axe-${p.name}.json`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });

        const severe = results.violations.filter((v) => SEVERE.has(v.impact ?? '')).map((v) => v.id).sort();
        expect(severe, 'severe axe violations vs. KNOWN_A11Y baseline').toEqual(KNOWN_A11Y[p.name] ?? []);
      } finally {
        await context?.close();
      }
    });
  }
});
