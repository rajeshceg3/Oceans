import { test, expect } from '@playwright/test';

test.describe('Oceans Expedition', () => {
  test.beforeEach(async ({ page }) => {
    // In a real scenario, we would mock the data or use a fixture
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Oceans/);
    await expect(page.locator('#app-header h1')).toHaveText('Oceans');
  });

  test('should display map', async ({ page }) => {
    const map = page.locator('#map');
    await expect(map).toBeVisible();
  });

  test('should display navigation items', async ({ page }) => {
      // Wait for data to load
      await page.waitForSelector('.nav-item');
      const navItems = page.locator('.nav-item');
      await expect(navItems).toHaveCount(5);
  });

  test('should open panel when navigation item is clicked', async ({ page }) => {
      await page.waitForSelector('.nav-item');
      await page.locator('#nav-0').click();

      const panel = page.locator('#info-panel');
      await expect(panel).toHaveClass(/active/);

      const title = page.locator('.ocean-title');
      await expect(title).toHaveText('Pacific Ocean');
  });
});
