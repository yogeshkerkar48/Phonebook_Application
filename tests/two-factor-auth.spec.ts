import { test, expect } from '@playwright/test';
import { authenticator } from 'otplib';

// Base URL points to the Nginx proxy
const BASE_URL = 'http://localhost:8081';

test.describe('Two-Factor Authentication Flow', () => {
    let userEmail;
    let userPassword = 'password123';
    let secret;

    test.beforeEach(async ({ page }) => {
        // Generate random credentials for each run
        const randomId = Math.random().toString(36).substring(7);
        userEmail = `2fa_user_${randomId}@example.com`;

        // Register a new user
        await page.goto(`${BASE_URL}/register`);
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('Setup 2FA and Login with OTP', async ({ page }) => {
        // 1. Login
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await expect(page).toHaveURL(`${BASE_URL}/`);
        await expect(page.locator('text=Welcome')).toBeVisible();

        // 2. Go to 2FA Setup
        // Check if "Enable 2FA" button is present and click it
        await page.getByRole('button', { name: /enable 2fa/i }).click();
        await expect(page).toHaveURL(`${BASE_URL}/2fa-setup`);

        // 3. Start Setup
        await page.getByRole('button', { name: /start setup/i }).click();

        // 4. Extract Secret
        // The secret is displayed in a <code> block
        const secretCodeElement = page.locator('code');
        await expect(secretCodeElement).toBeVisible();
        secret = await secretCodeElement.innerText();
        console.log('Detected Secret:', secret);
        expect(secret).toBeTruthy();

        // 5. Generate Token
        // Use otplib to generate the current token
        const token = authenticator.generate(secret);

        // 6. Enter Token
        await page.fill('input#otp', token);
        await page.getByRole('button', { name: /verify/i }).click();

        // 7. Verify Success and Redirection to Login
        // Expect success toast or URL change
        // The app logs out and redirects to login on success
        await expect(page).toHaveURL(`${BASE_URL}/login`);

        // 8. Login Again (Expect 2FA Challenge)
        await page.fill('input[name="email"]', userEmail);
        await page.fill('input[name="password"]', userPassword);
        await page.click('button[type="submit"]');

        // 9. Assert Redirect to 2FA Verify Page
        await expect(page).toHaveURL(`${BASE_URL}/2fa-verify`);

        // 10. Enter Valid OTP
        const newToken = authenticator.generate(secret);
        await page.fill('input#code', newToken);
        await page.getByRole('button', { name: /verify/i }).click();

        // 11. Assert Dashboard Access
        await expect(page).toHaveURL(`${BASE_URL}/`);
        await expect(page.locator('text=Welcome')).toBeVisible();
    });
});
