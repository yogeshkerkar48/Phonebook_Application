import { test, expect, Page } from '@playwright/test';

/**
 * PASSWORD VALIDATION TESTS
 * 
 * Tests password validation for user registration.
 * Validates: Minimum 8 characters required
 * 
 * Run with: npx playwright test password-only.spec.ts --project=chromium
 */

const BASE_URL = 'http://localhost:8081';

test.describe('Password Size Validation - Registration', () => {

    test('Password with less than 8 characters should show error', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const shortPasswords = ['1', '12', '123', '1234', '12345', '123456', '1234567'];

        for (const shortPassword of shortPasswords) {
            const uniqueEmail = `test${Date.now()}@example.com`;

            await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
            await page.getByRole('textbox', { name: 'Password' }).fill(shortPassword);
            await page.getByRole('button', { name: 'Register' }).click();

            // Assert: Error toast appears
            const errorToast = page.locator('.Vue-Toastification__toast--error').first();
            await expect(errorToast).toBeVisible({ timeout: 10000 });

            // Verify error message
            await expect(errorToast).toContainText(/Password should be of 8 or more characters/i);

            console.log(`✓ Password "${shortPassword}" (${shortPassword.length} chars) rejected`);

            // Wait for toast to disappear and clear fields
            await page.waitForTimeout(1000);
            await page.getByRole('textbox', { name: 'Email address' }).clear();
            await page.getByRole('textbox', { name: 'Password' }).clear();
        }
    });

    test('Password with exactly 8 characters should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const validPasswords = [
            '12345678',      // 8 digits
            'abcdefgh',      // 8 letters
            'Pass1234',      // 8 mixed
            '!@#$%^&*'       // 8 special chars
        ];

        for (const validPassword of validPasswords) {
            const uniqueEmail = `test${Date.now()}@example.com`;

            await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
            await page.getByRole('textbox', { name: 'Password' }).fill(validPassword);
            await page.getByRole('button', { name: 'Register' }).click();

            // Assert: Success toast and redirect
            await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });
            await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

            console.log(`✓ Password "${validPassword}" (${validPassword.length} chars) accepted`);

            // Navigate back to register page for next test
            await page.goto(`${BASE_URL}/register`, { timeout: 30000 });
            await page.waitForTimeout(500);
        }
    });

    test('Password with more than 8 characters should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const validPasswords = [
            '123456789',           // 9 chars
            '1234567890',          // 10 chars
            'Password123',         // 11 chars
            'VerySecurePassword',  // 18 chars
            'ThisIsAVeryLongPasswordWith30Ch'  // 32 chars
        ];

        for (const validPassword of validPasswords) {
            const uniqueEmail = `test${Date.now()}@example.com`;

            await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
            await page.getByRole('textbox', { name: 'Password' }).fill(validPassword);
            await page.getByRole('button', { name: 'Register' }).click();

            // Assert: Success toast and redirect
            await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });
            await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

            console.log(`✓ Password with ${validPassword.length} characters accepted`);

            // Navigate back to register page for next test
            await page.goto(`${BASE_URL}/register`, { timeout: 30000 });
            await page.waitForTimeout(500);
        }
    });

    test('Empty password should show error', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('');
        await page.getByRole('button', { name: 'Register' }).click();

        // HTML5 required validation should prevent submission
        const passwordInput = page.getByRole('textbox', { name: 'Password' });
        const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);

        expect(validationMessage).toBeTruthy();
        console.log('✓ Empty password blocked by browser:', validationMessage);
    });
});

test.describe('Password Validation - Different Character Types', () => {

    test('Password with only numbers (8+ chars) should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;

        await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Numeric-only password (8 chars) accepted');
    });

    test('Password with only letters (8+ chars) should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;

        await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('abcdefgh');
        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Letter-only password (8 chars) accepted');
    });

    test('Password with special characters (8+ chars) should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;

        await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('!@#$%^&*');
        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Special character password (8 chars) accepted');
    });

    test('Password with mixed characters (8+ chars) should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;

        await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('Pass123!');
        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Mixed character password (8 chars) accepted');
    });
});

test.describe('Password Validation - Backend API', () => {

    test('Backend API should reject password less than 8 characters', async ({ page }) => {
        const response = await page.request.post('http://localhost:8081/api/register', {
            data: {
                email: `test${Date.now()}@example.com`,
                password: '1234567' // Only 7 chars
            }
        });

        // Should return 422 validation error
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body.detail).toBeTruthy();

        // Check that error mentions password
        const errorMessage = JSON.stringify(body.detail);
        expect(errorMessage).toContain('password');

        console.log('✓ Backend API rejects short password');
    });

    test('Backend API should accept password with 8 or more characters', async ({ page }) => {
        const response = await page.request.post('http://localhost:8081/api/register', {
            data: {
                email: `test${Date.now()}@example.com`,
                password: '12345678' // 8 chars
            }
        });

        // Should return 201 created
        expect(response.status()).toBe(201);

        console.log('✓ Backend API accepts valid password');
    });
});

test.describe('Password Validation - Edge Cases', () => {

    test('Password with spaces (8+ chars total) should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;

        await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('pass word'); // 9 chars with space
        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Password with spaces (9 chars) accepted');
    });

    test('Password with unicode characters (8+ chars) should succeed', async ({ page }) => {
        await page.goto(`${BASE_URL}/register`, { timeout: 30000 });

        const uniqueEmail = `test${Date.now()}@example.com`;

        await page.getByRole('textbox', { name: 'Email address' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Password' }).fill('pässwörd'); // 8 chars with unicode
        await page.getByRole('button', { name: 'Register' }).click();

        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

        console.log('✓ Password with unicode characters accepted');
    });
});
