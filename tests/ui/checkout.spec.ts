import { test, expect } from '../../src/fixtures/test';
import { CHECKOUT_CUSTOMER } from '../../src/data/users';

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];
const TAX_RATE = 0.08;

test.describe('Checkout', () => {
  test('completes an order and the totals add up @smoke', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.goto();
    const expectedSubtotal = (await Promise.all(PRODUCTS.map((p) => inventoryPage.priceOf(p)))).reduce((a, b) => a + b, 0);

    await inventoryPage.addToCart(...PRODUCTS);
    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toHaveText(PRODUCTS);

    await cartPage.checkout();
    await checkoutPage.fillCustomer(CHECKOUT_CUSTOMER);

    const { subtotal, tax, total } = await checkoutPage.summary();
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(tax).toBeCloseTo(Math.round(subtotal * TAX_RATE * 100) / 100, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  const missing = [
    { field: 'first name', data: { ...CHECKOUT_CUSTOMER, firstName: '' }, error: 'First Name is required' },
    { field: 'last name', data: { ...CHECKOUT_CUSTOMER, lastName: '' }, error: 'Last Name is required' },
    { field: 'postal code', data: { ...CHECKOUT_CUSTOMER, postalCode: '' }, error: 'Postal Code is required' },
  ];

  for (const m of missing) {
    test(`blocks checkout without ${m.field} @regression`, async ({ page, checkoutPage }) => {
      await page.goto('/checkout-step-one.html');
      await checkoutPage.fillCustomer(m.data);
      await expect(checkoutPage.error).toContainText(m.error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});
