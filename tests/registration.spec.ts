import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';

test.describe('Registration - Email Validation', () => {

  test('Invalid email format should show error', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    const emailInput = page.getByRole('textbox', { name: 'Email address' });

    // This is 100% invalid in HTML5 (no @ symbol)
    await emailInput.fill('invalidemail');
    await emailInput.blur(); // Trigger validation

    const isValid = await emailInput.evaluate((el): boolean => (el as HTMLInputElement).checkValidity());
    expect(isValid).toBe(false);

    const validationMessage = await emailInput.evaluate((el): string => (el as HTMLInputElement).validationMessage);
    expect(validationMessage).toContain('\'@\''); // Usually says "Please include an '@'..."

    console.log('Invalid email blocked by browser:', validationMessage);
  });

  test('Valid email format should succeed', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    const uniqueEmail = `test${Date.now()}@example.com`;

    await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill('00000000');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('.Vue-Toastification__toast--success')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });

    console.log('Valid registration successful:', uniqueEmail);
  });
});

test.describe('Registration - Password Validation', () => {

  test('Password less than 8 characters should show error', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('1234567'); // 7 chars
    await page.getByRole('button', { name: 'Register' }).click();

    const errorToast = page.locator('.Vue-Toastification__toast--error');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    await expect(errorToast).toContainText(/8/i);

    console.log('Short password correctly rejected');
  });

  test('Password with 8+ characters should succeed', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    const uniqueEmail = `test${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('.Vue-Toastification__toast--success')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/login/i);
  });
});

test.describe('Registration - Combined & Edge Cases', () => {

  test('Empty email should trigger HTML5 validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.getByRole('button', { name: 'Register' }).click();

    const emailInput = page.getByRole('textbox', { name: 'Email address' });

    const validationMessage = await emailInput.evaluate((el): string =>
      (el as HTMLInputElement).validationMessage
    );

    expect(validationMessage).toBeTruthy();
    expect(validationMessage.toLowerCase()).toContain('fill');

    console.log('Empty field blocked by HTML5:', validationMessage);
  });

  test('Duplicate email should be rejected by backend', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await page.getByRole('textbox', { name: 'Email address' }).fill('abv@gmail.com'); // ← your existing user
    await page.getByRole('textbox', { name: 'Password' }).fill('00000000');
    await page.getByRole('button', { name: 'Register' }).click();

    const errorToast = page.locator('.Vue-Toastification__toast--error');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    await expect(errorToast).toContainText(/already|exists|taken/i);

    console.log('Duplicate email correctly rejected');
  });

  test('Complete flow from login → register → success', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Flexible text match for the link
    await page.getByRole('link', { name: /don't have.*account|sign up|register/i }).click();

    await expect(page).toHaveURL(/register/, { timeout: 10000 });

    const email = `user${Date.now()}@test.com`;
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('MySecurePass123');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('.Vue-Toastification__toast--success')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });

    console.log('End-to-end registration flow passed!');
  });
});