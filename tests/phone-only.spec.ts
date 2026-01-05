import { test, expect, Page } from '@playwright/test';

/**
 * MOBILE NUMBER VALIDATION TESTS
 * 
 * Tests phone number validation for contact forms.
 * Validates: Exactly 10 digits required, unique phone numbers
 * 
 * Run with: npx playwright test phone-only.spec.ts --project=chromium
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

test.describe('Phone Number Size Validation', () => {

    test('Phone number with less than 10 digits should show error', async ({ page }) => {
        await login(page);

        const invalidPhones = ['1', '12', '123', '1234567', '123456789']; // Less than 10 digits

        for (const invalidPhone of invalidPhones) {
            await page.getByRole('button', { name: 'Add Contact' }).click();
            await page.getByRole('textbox', { name: 'Name *' }).fill('Test Contact');
            await page.getByRole('textbox', { name: 'Phone *' }).fill(invalidPhone);
            await page.getByRole('button', { name: 'Add Contact' }).click();

            // Assert: Error toast appears
            const errorToast = page.locator('.Vue-Toastification__toast--error').first();
            await expect(errorToast).toBeVisible({ timeout: 10000 });

            // Verify error message
            await expect(errorToast).toContainText(/number should be 10 digit/i);

            console.log(`✓ Phone "${invalidPhone}" (${invalidPhone.length} digits) rejected`);

            // Wait for toast to disappear
            await page.waitForTimeout(1000);
        }
    });

    test('Phone number with more than 10 digits should show error', async ({ page }) => {
        await login(page);

        const invalidPhones = ['12345678901', '123456789012', '1234567890123']; // More than 10 digits

        for (const invalidPhone of invalidPhones) {
            await page.getByRole('button', { name: 'Add Contact' }).click();
            await page.getByRole('textbox', { name: 'Name *' }).fill('Test Contact');
            await page.getByRole('textbox', { name: 'Phone *' }).fill(invalidPhone);
            await page.getByRole('button', { name: 'Add Contact' }).click();

            // Assert: Error toast appears
            const errorToast = page.locator('.Vue-Toastification__toast--error').first();
            await expect(errorToast).toBeVisible({ timeout: 10000 });

            // Verify error message
            await expect(errorToast).toContainText(/number should be 10 digit/i);

            console.log(`✓ Phone "${invalidPhone}" (${invalidPhone.length} digits) rejected`);

            // Wait for toast to disappear
            await page.waitForTimeout(1000);
        }
    });

    test('Phone number with non-numeric characters should show error', async ({ page }) => {
        await login(page);

        const invalidPhones = [
            'abcdefghij',      // Letters
            '123-456-789',     // Dashes
            '(123)456789',     // Parentheses
            '123 456 7890',    // Spaces
            '12345678a0'       // Mixed
        ];

        for (const invalidPhone of invalidPhones) {
            await page.getByRole('button', { name: 'Add Contact' }).click();
            await page.getByRole('textbox', { name: 'Name *' }).fill('Test Contact');
            await page.getByRole('textbox', { name: 'Phone *' }).fill(invalidPhone);
            await page.getByRole('button', { name: 'Add Contact' }).click();

            // Assert: Error toast appears
            const errorToast = page.locator('.Vue-Toastification__toast--error').first();
            await expect(errorToast).toBeVisible({ timeout: 10000 });

            // Verify error message
            await expect(errorToast).toContainText(/number should be 10 digit/i);

            console.log(`✓ Phone "${invalidPhone}" (non-numeric) rejected`);

            // Wait for toast to disappear
            await page.waitForTimeout(1000);
        }
    });

    test('Valid 10-digit phone number should succeed', async ({ page }) => {
        await login(page);

        const validPhones = [
            '1234567890',
            '9876543210',
            '5555555555',
            '0000000000'
        ];

        for (const validPhone of validPhones) {
            const uniqueName = `Contact ${Date.now()}`;

            await page.getByRole('button', { name: 'Add Contact' }).click();
            await page.getByRole('textbox', { name: 'Name *' }).fill(uniqueName);
            await page.getByRole('textbox', { name: 'Phone *' }).fill(validPhone);
            await page.getByRole('textbox', { name: 'Email' }).fill(`${uniqueName.replace(' ', '')}@example.com`);
            await page.getByRole('button', { name: 'Add Contact' }).click();

            // Assert: Success toast appears
            await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

            console.log(`✓ Phone "${validPhone}" (10 digits) accepted`);

            // Wait for toast to disappear
            await page.waitForTimeout(1000);
        }
    });
});

test.describe('Unique Phone Number Validation', () => {

    test('Duplicate phone number should show error', async ({ page }) => {
        await login(page);

        const duplicatePhone = '5555555555';

        // Add first contact
        await page.getByRole('button', { name: 'Add Contact' }).click();
        await page.getByRole('textbox', { name: 'Name *' }).fill('First Contact');
        await page.getByRole('textbox', { name: 'Phone *' }).fill(duplicatePhone);
        await page.getByRole('textbox', { name: 'Email' }).fill('first@example.com');
        await page.getByRole('button', { name: 'Add Contact' }).click();

        // Wait for success
        await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });
        console.log('✓ First contact added successfully');

        await page.waitForTimeout(2000); // Wait for toast to disappear

        // Try to add second contact with SAME phone number
        await page.getByRole('button', { name: 'Add Contact' }).click();
        await page.getByRole('textbox', { name: 'Name *' }).fill('Second Contact');
        await page.getByRole('textbox', { name: 'Phone *' }).fill(duplicatePhone); // Same phone!
        await page.getByRole('textbox', { name: 'Email' }).fill('second@example.com');
        await page.getByRole('button', { name: 'Add Contact' }).click();

        // Assert: Error toast for duplicate
        const errorToast = page.locator('.Vue-Toastification__toast--error').first();
        await expect(errorToast).toBeVisible({ timeout: 10000 });

        // Verify error message mentions duplicate/unique/already exists
        await expect(errorToast).toContainText(/duplicate|unique|already|constraint|exists/i);

        console.log('✓ Duplicate phone number rejected');
    });

    test('Different phone numbers should succeed', async ({ page }) => {
        await login(page);

        const phones = ['1111111111', '2222222222', '3333333333'];

        for (let i = 0; i < phones.length; i++) {
            await page.getByRole('button', { name: 'Add Contact' }).click();
            await page.getByRole('textbox', { name: 'Name *' }).fill(`Contact ${i + 1}`);
            await page.getByRole('textbox', { name: 'Phone *' }).fill(phones[i]);
            await page.getByRole('textbox', { name: 'Email' }).fill(`contact${i + 1}@example.com`);
            await page.getByRole('button', { name: 'Add Contact' }).click();

            // Assert: Success
            await expect(page.locator('.Vue-Toastification__toast--success').first()).toBeVisible({ timeout: 10000 });

            console.log(`✓ Phone "${phones[i]}" accepted (unique)`);

            await page.waitForTimeout(1000);
        }
    });
});

test.describe('Phone Number Validation - Backend API', () => {

    test('Backend API should reject invalid phone number', async ({ page }) => {
        // Login first to get auth token
        await login(page);

        // Get the auth token from localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));

        // Test API directly
        const response = await page.request.post('http://localhost:8081/api/contacts/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                name: 'Test Contact',
                phone: '123', // Invalid - too short
                email: 'test@example.com',
                address: 'Test Address'
            }
        });

        // Should return 422 validation error
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body.detail).toBeTruthy();

        console.log('✓ Backend API rejects invalid phone number');
    });

    test('Backend API should accept valid phone number', async ({ page }) => {
        // Login first to get auth token
        await login(page);

        // Get the auth token from localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));

        const uniquePhone = `${Date.now()}`.slice(-10);

        // Test API directly
        const response = await page.request.post('http://localhost:8081/api/contacts/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                name: 'Valid Contact',
                phone: uniquePhone, // Valid - 10 digits
                email: 'valid@example.com',
                address: 'Valid Address'
            }
        });

        // Should return 201 created
        expect(response.status()).toBe(201);

        console.log('✓ Backend API accepts valid phone number');
    });
});
