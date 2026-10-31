import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { USERS } from '../../src/data/users';
import { STANDARD_USER_STATE } from '../../playwright.config';

setup('log in as standard_user once and save the session', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STANDARD_USER_STATE });
});
