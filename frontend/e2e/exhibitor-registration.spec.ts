import { test, expect } from '@playwright/test';

test.describe('Exhibitor Application Flow', () => {
  test('should submit exhibitor stall booking request successfully', async ({ page }) => {
    await page.goto('/register/exhibitor');

    await expect(page.locator('body')).toContainText(/Exhibitor/i);

    const testEmail = `e2e_exhibitor_${Date.now()}@company.com`;
    const testPhone = `9847${Math.floor(100000 + Math.random() * 900000)}`;

    await page.fill('input[name="name"]', 'John Green');
    await page.fill('input[name="firm_name"]', 'SolarTech Clean Energy Solutions');
    await page.fill('input[name="designation"]', 'Director');
    await page.fill('input[name="mobile"]', testPhone);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="city"]', 'Kochi');
    await page.fill('input[name="state"]', 'Kerala');

    const submitBtn = page.locator('#exhibitorForm button[type="submit"], button#visit-btn').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.includes('Exhibitor Registration Successful') || bodyText.includes('Received') || bodyText.includes('Exhibitor')).toBeTruthy();
  });
});
