import { test, expect, Page } from '@playwright/test';

// Base URL points to the Nginx proxy
const BASE_URL = 'http://localhost:8081';

/**
 * This test verifies the search functionality on the Dashboard page.
 * It logs in, performs a search, checks that suggestions appear,
 * selects a suggestion, and ensures the contact list updates.
 */
test.describe('Contact Search', () => {
    // Helper to perform login (reuses existing credentials)
    const login = async (page: Page) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByRole('textbox', { name: 'Email address' }).fill('abv@gmail.com');
        await page.getByRole('textbox', { name: 'Password' }).fill('00000000');
        await page.getByRole('button', { name: /sign in|login/i }).click();
        // Wait for dashboard to be visible
        await expect(page.getByRole('button', { name: /add contact/i })).toBeVisible({ timeout: 10000 });
    };

    test('Search existing contact via suggestions and button', async ({ page }) => {
        // 1. Log in
        await login(page);

        // 2. Ensure we are on the dashboard
        await page.goto(`${BASE_URL}/`);
        await expect(page.getByPlaceholder('Search contacts...')).toBeVisible();

        // [Pre-condition] Create a contact to ensure search works
        // Click Add Contact (use first() because there might be multiple or based on text)
        await page.getByRole('button', { name: 'Add Contact' }).first().click();

        // Fill Contact Form
        const uniquePhone = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
        await page.locator('#name').fill('Test Contact');
        await page.locator('#phone').fill(uniquePhone);
        await page.locator('#email').fill('test@example.com');
        await page.getByRole('button', { name: 'Add Contact', exact: true }).click();

        // Wait for redirection to dashboard
        await expect(page.getByPlaceholder('Search contacts...')).toBeVisible();

        // 3. Type a query that should match (e.g., "Test")
        const query = 'Test';
        await page.getByPlaceholder('Search contacts...').fill(query);

        // 4. Verify suggestions dropdown appears with at least one item
        // Selector matches Dashboard.vue implementation
        const suggestionList = page.locator('.absolute.z-10.w-full.bg-gray-800');
        await expect(suggestionList).toBeVisible({ timeout: 10000 });
        // Fix: Use correct matcher 
        await expect(suggestionList.locator('li')).not.toHaveCount(0);

        // 5. Click the first suggestion
        await suggestionList.locator('li').first().click();

        // 6. The search should be performed; verify results list updates
        // Note: ContactList.vue uses class "contact-item", not data-test attribute
        const contactItems = page.locator('.contact-item');
        await expect(contactItems.first()).toBeVisible({ timeout: 10000 });
        // Ensure at least one result contains the query text
        await expect(contactItems.filter({ hasText: query })).not.toHaveCount(0);

        // 7. Alternatively, perform a manual search via the button with no results
        await page.getByPlaceholder('Search contacts...').fill('NonExistingXYZ');
        await page.getByRole('button', { name: /search/i }).click();

        // Expect empty state (ContactList.vue renders .empty-state with "No contacts yet")
        // We look for the container or the text
        const emptyState = page.locator('.empty-state');
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toContainText('No contacts yet');
    });
});
