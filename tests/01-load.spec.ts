import { test, expect } from '@playwright/test';

test('app loads and map container is visible', async ({ page }) => {
  await page.goto('http://localhost:5173'); // vite default
  await expect(page.locator('.leaflet-container')).toBeVisible();
  // Basic check for controls
  await expect(page.getByText('Draw area on map')).toBeVisible();
});
