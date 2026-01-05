import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';

test.describe('Search Bug Reproduction', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', 'abv@gmail.com');
        await page.fill('input[name="password"]', '00000000');
        await page.click('button[type="submit"]');
        await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('Search for short name "yuo" with long phone number', async ({ page }) => {
        // 1. Create the contact "yuo"
        await page.getByRole('button', { name: 'Add Contact' }).first().click();
        await page.fill('#name', 'yuo');
        await page.fill('#phone', '4545454545'); // Long phone number
        await page.fill('#email', 'lkj@gmail.com');
        await page.click('button:has-text("Add Contact")');

        // Wait for dashboard and contact to appear
        await expect(page.locator('.contact-name', { hasText: 'yuo' })).toBeVisible();

        // 2. Search for "yuo"
        await page.fill('input[placeholder="Search contacts..."]', 'yuo');
        await page.click('button:has-text("Search")');

        // 3. Verify it is found and NOT "No contacts yet"
        const emptyState = page.locator('.empty-state');
        await expect(emptyState).not.toBeVisible();

        const results = page.locator('.contact-item');
        await expect(results).toHaveCount({ min: 1 });
        await expect(results.filter({ hasText: 'yuo' })).toBeVisible();

        // Cleanup (optional, but good)
        await page.locator('.contact-item', { hasText: 'yuo' }).getByRole('button', { name: 'Delete' }).click();
        page.on('dialog', dialog => dialog.accept());
    });
});
