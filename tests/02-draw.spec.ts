import { test, expect } from '@playwright/test';

test('user can draw polygon and it appears in sidebar', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Enable drawing mode
  await page.getByText('Draw area on map').click();

  // Click 3 times on map to add points, then double-click to finish
  const map = page.locator('.leaflet-container');
  const box = await map.boundingBox();
  if (!box) throw new Error('map bounding box not found');

  // click approx center points
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.3);
  await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.6);
  // double click to finish
  await page.mouse.dblclick(box.x + box.width * 0.45, box.y + box.height * 0.6);

  // Expect an area to appear in sidebar list
  await expect(page.locator('text=Area 1')).toBeVisible();
});
