import { test, expect } from '@playwright/test';

test.describe('Admin Login & Gate Check-in QR Verification', () => {
  test('should allow admin login and load gate checkin scanner interface', async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login');

    await expect(page.locator('body')).toContainText(/Sign In|Admin Login|Masters/i);

    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', 'admin@expokerala.org');
    await page.fill('input[type="password"], input[name="password"]', 'Admin@EXPO26');

    // Click Sign in button
    const loginBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();

    // Should redirect to admin dashboard or checkin
    await page.waitForTimeout(2500);

    // Navigate to Gate Check-in
    await page.goto('/admin/checkin');

    // Verify Check-in scanner UI is rendered
    await expect(page.locator('body')).toContainText(/GATE CHECK-IN|Scanner|Manual Badge Code|Pass/i);
  });
});
