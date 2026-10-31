import { test, expect } from '../../src/fixtures/test';
import { USERS, CHECKOUT_CUSTOMER } from '../../src/data/users';

/**
 * saucedemo ships deliberately broken accounts. These tests describe the CORRECT behaviour and are
 * marked test.fail(): they pass while the defect exists and turn red the day it is fixed, so the
 * defect list stays honest instead of living in a spreadsheet.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Known defects', () => {
  test('problem_user: last name keeps what was typed @regression', async ({ page, loginPage, checkoutPage }) => {
    test.fail(true, 'DEFECT: typing into Last Name overwrites First Name for problem_user');
    await loginPage.goto();
    await loginPage.login(USERS.problem);
    await page.goto('/checkout-step-one.html');
    await checkoutPage.firstName.fill(CHECKOUT_CUSTOMER.firstName);
    await checkoutPage.lastName.fill(CHECKOUT_CUSTOMER.lastName);
    await expect(checkoutPage.lastName).toHaveValue(CHECKOUT_CUSTOMER.lastName, { timeout: 3_000 });
  });

  test('problem_user: each product shows its own image @regression', async ({ loginPage, inventoryPage }) => {
    test.fail(true, 'DEFECT: every product shows the same placeholder image for problem_user');
    await loginPage.goto();
    await loginPage.login(USERS.problem);
    await expect(inventoryPage.items).toHaveCount(6);
    const sources = await inventoryPage.items.locator('img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')));
    expect(new Set(sources).size).toBe(sources.length);
  });
});
