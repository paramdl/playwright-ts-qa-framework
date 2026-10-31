import { test, expect } from '../../src/fixtures/test';
import type { SortOption } from '../../src/pages/InventoryPage';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  const sorts: { option: SortOption; label: string; check: (names: string[], prices: number[]) => void }[] = [
    { option: 'az', label: 'name A to Z', check: (n) => expect(n).toEqual([...n].sort((a, b) => a.localeCompare(b))) },
    { option: 'za', label: 'name Z to A', check: (n) => expect(n).toEqual([...n].sort((a, b) => b.localeCompare(a))) },
    { option: 'lohi', label: 'price low to high', check: (_, p) => expect(p).toEqual([...p].sort((a, b) => a - b)) },
    { option: 'hilo', label: 'price high to low', check: (_, p) => expect(p).toEqual([...p].sort((a, b) => b - a)) },
  ];

  for (const s of sorts) {
    test(`sorts by ${s.label} @regression`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(s.option);
      s.check(await inventoryPage.names(), await inventoryPage.prices());
    });
  }

  test('cart badge tracks adds and removes @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();
    await inventoryPage.addToCart('Sauce Labs Backpack', 'Sauce Labs Bike Light');
    await expect(inventoryPage.cartBadge).toHaveText('2');
    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('every product has a name, a positive price and an image @regression', async ({ inventoryPage }) => {
    const prices = await inventoryPage.prices();
    expect(prices).toHaveLength(6);
    for (const p of prices) expect(p).toBeGreaterThan(0);
    for (const name of await inventoryPage.names()) expect(name.trim()).not.toBe('');
    const images = inventoryPage.items.locator('img');
    for (const img of await images.all()) {
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    }
  });
});
