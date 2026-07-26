import { test, expect } from '@playwright/test';

test('Canvas Chain web app smoke test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Canvas Chain/i);
  await expect(page.getByText('Canvas Chain Architect')).toBeVisible();
});
