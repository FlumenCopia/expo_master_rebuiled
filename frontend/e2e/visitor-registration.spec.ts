import { test, expect } from '@playwright/test';

test.describe('Visitor Registration Flow', () => {
  test('should render public visitor registration form and submit successfully', async ({ page }) => {
    await page.goto('/register/visitor');

    await expect(page.locator('body')).toContainText(/Register|Pass|Now/i);

    const testPhone = `9847${Math.floor(100000 + Math.random() * 900000)}`;
    const testEmail = `e2e_visitor_${Date.now()}@test.com`;

    // Fill form inputs
    await page.fill('input[name="mobile"]', testPhone);
    await page.fill('input[name="name"]', 'Playwright Test Visitor');
    await page.selectOption('select[name="visit_profile"]', 'Public');
    await page.fill('input[name="email"]', testEmail);

    // Submit form
    const submitBtn = page.locator('#visitorRegisterForm button[type="submit"], button#visit-btn').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify confirmation modal or badge pass
    await page.waitForTimeout(2000);
    const modalText = await page.locator('body').innerText();
    expect(modalText.includes('Successful') || modalText.includes('Confirmed') || modalText.includes('Badge')).toBeTruthy();
  });
});
