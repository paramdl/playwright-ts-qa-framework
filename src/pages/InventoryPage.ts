import { expect, type Locator, type Page } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await expect(this.title).toHaveText('Products');
  }

  /** Product names map to data-test ids, e.g. "Sauce Labs Backpack" -> add-to-cart-sauce-labs-backpack. */
  private slug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async addToCart(...names: string[]) {
    for (const name of names) await this.page.getByTestId(`add-to-cart-${this.slug(name)}`).click();
  }

  async removeFromCart(name: string) {
    await this.page.getByTestId(`remove-${this.slug(name)}`).click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async names() {
    return this.itemNames.allTextContents();
  }

  async prices() {
    return (await this.itemPrices.allTextContents()).map((p) => Number(p.replace('$', '')));
  }

  async priceOf(name: string) {
    const item = this.items.filter({ has: this.page.getByText(name, { exact: true }) });
    return Number((await item.getByTestId('inventory-item-price').textContent())!.replace('$', ''));
  }

  async openCart() {
    await this.cartLink.click();
  }
}
