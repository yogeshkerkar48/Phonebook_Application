import { test, expect, Page } from '@playwright/test';

/**
 * EMAIL VALIDATION TESTS
 * 
 * Tests email validation for both registration and contact forms.
 * Note: HTML5 type="email" validates BEFORE backend submission.
 * 
 * Run with: npx playwright test email-only.spec.ts --project=chromium
 */

const BASE_URL = 'http://localhost:8081';
const TEST_USER = {
    email: 'abv@gmail.com',
    password: '00000000'
};

// Helper function to login
async function login(page: Page) {
    await page.goto(`${BASE_URL}/login`, { timeout: 30000 });
    await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_USER.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('button', { name: 'Add Contact' })).toBeVisible({ timeout: 10000 });
}

test.describe('Email Validation - Registration', () => {

    test('Invalid email format should be blocked by browser', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const emailInput = page.getByRole('textbox', { name: 'Email address' });
        await emailInput.fill('notanemail'); // Invalid email
        await page.getByRole('textbox', { name: 'Password' }).fill('12345678');

        // Check HTML5 validation state
        const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
        expect(isValid).toBe(false);

        // Get validation message
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();

        console.log('✓ Browser blocks invalid email:', validationMessage);
    });

    test('Valid email format should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;
        const emailInput = page.getByRole('textbox', { name: 'Email address' });

        await emailInput.fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('12345678');

        // Check HTML5 validation passes
        const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
        expect(isValid).toBe(true);

        // Submit form
        await page.getByRole('button', { name: 'Register' }).click();

        // Should show success and redirect
        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

        console.log('✓ Valid email accepted:', uniqueEmail);
    });
});

test.describe('Email Validation - Contact Form', () => {

    test('Invalid email in contact should be blocked by browser', async ({ page }) => {
        await login(page);

        await page.getByRole('button', { name: 'Add Contact' }).click();
        await page.getByRole('textbox', { name: 'Name *' }).fill('Test Contact');
        await page.getByRole('textbox', { name: 'Phone *' }).fill('1234567890');

        const emailInput = page.getByRole('textbox', { name: 'Email' });
        await emailInput.fill('invalidemail'); // No @ or domain

        // Check HTML5 validation
        const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
        expect(isValid).toBe(false);

        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();

        console.log('✓ Browser blocks invalid contact email:', validationMessage);
    });

    test('Valid email in contact should succeed', async ({ page }) => {
        await login(page);

        const uniquePhone = `${Date.now()}`.slice(-10);

        await page.getByRole('button', { name: 'Add Contact' }).click();
        await page.getByRole('textbox', { name: 'Name *' }).fill('Valid Contact');
        await page.getByRole('textbox', { name: 'Phone *' }).fill(uniquePhone);

        const emailInput = page.getByRole('textbox', { name: 'Email' });
        await emailInput.fill('valid@example.com');

        // Check HTML5 validation passes
        const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
        expect(isValid).toBe(true);

        // Submit form
        await page.getByRole('button', { name: 'Add Contact' }).click();

        // Should show success
        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Valid contact email accepted');
    });
});

test.describe('Email Validation - Backend API', () => {

    test('Backend API should reject invalid email', async ({ page }) => {
        // Test API directly (bypasses browser validation)
        const response = await page.request.post('http://localhost:8081/api/register', {
            data: {
                email: 'notanemail',
                password: '12345678'
            }
        });

        // Should return 422 validation error
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body.detail).toBeTruthy();

        console.log('✓ Backend rejects invalid email via API');
    });

    test('Backend API should accept valid email', async ({ page }) => {
        const uniqueEmail = `test${Date.now()}@example.com`;

        const response = await page.request.post('http://localhost:8081/api/register', {
            data: {
                email: uniqueEmail,
                password: '12345678'
            }
        });

        // Should return 201 created
        expect(response.status()).toBe(201);

        console.log('✓ Backend accepts valid email via API');
    });
});
