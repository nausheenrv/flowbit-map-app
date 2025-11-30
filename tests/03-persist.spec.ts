import { test, expect } from '@playwright/test';

test('saved AOIs persist across reload', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Simpler path: add area via a developer debug button made available in dev mode
  // For the test, we assume your app exposes window.__addTestArea() in dev
  await page.evaluate(() => {
    // @ts-ignore
    window.__addTestArea && window.__addTestArea();
  });

  // Validate Area exists
  await expect(page.locator('text=Area 1')).toBeVisible();

  await page.reload();
  await expect(page.locator('text=Area 1')).toBeVisible();
});
