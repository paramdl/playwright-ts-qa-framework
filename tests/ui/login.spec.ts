import { test, expect } from '../../src/fixtures/test';
import { USERS } from '../../src/data/users';

// Login tests start logged out, so they drop the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user lands on the product list @smoke', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(USERS.standard);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('locked-out user is blocked with a clear message @regression', async ({ page, loginPage }) => {
    await loginPage.login(USERS.lockedOut);
    await loginPage.expectError('Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  const invalid = [
    { name: 'empty form', user: '', pass: '', error: 'Username is required' },
    { name: 'missing password', user: USERS.standard, pass: '', error: 'Password is required' },
    { name: 'wrong password', user: USERS.standard, pass: 'wrong', error: 'Username and password do not match' },
    { name: 'unknown user', user: 'no_such_user', pass: 'secret_sauce', error: 'Username and password do not match' },
  ];

  for (const c of invalid) {
    test(`rejects ${c.name} @regression`, async ({ loginPage }) => {
      await loginPage.username.fill(c.user);
      await loginPage.password.fill(c.pass);
      await loginPage.loginButton.click();
      await loginPage.expectError(c.error);
    });
  }

  test('wrong password and unknown user get the same message (no user enumeration) @regression', async ({ loginPage }) => {
    await loginPage.login(USERS.standard, 'wrong');
    const wrongPassword = await loginPage.error.textContent();
    await loginPage.goto();
    await loginPage.login('no_such_user', 'wrong');
    await expect(loginPage.error).toHaveText(wrongPassword!);
  });

  test('protected page redirects to login when logged out @regression', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.loginButton).toBeVisible();
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in.");
  });
});
