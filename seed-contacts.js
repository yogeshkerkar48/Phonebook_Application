const { chromium } = require('playwright');

// Configuration
const BASE_URL = 'http://localhost:8081'; // Adjust if needed
const EMAIL = 'pqr@gmail.com'; // Your login email
const PASSWORD = 'password123'; // Your login password
const CONTACT_COUNT = 50;

// Random Data Generators
const randomString = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const randomPhone = () => {
    // Generate valid 10-digit phone starting with 6-9
    const first = Math.floor(Math.random() * 4) + 6;
    const rest = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${first}${rest}`;
};

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: false }); // Visible browser
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Login
        console.log(`Logging in as ${EMAIL}...`);
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', EMAIL);
        await page.fill('input[type="password"]', PASSWORD);
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await page.waitForURL('**/');
        console.log('Login successful!');

        // 2. Loop to create contacts
        for (let i = 1; i <= CONTACT_COUNT; i++) {
            try {
                const firstName = randomString(5);
                const lastName = randomString(6);
                const fullName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
                const phone = randomPhone();
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

                console.log(`[${i}/${CONTACT_COUNT}] Adding: ${fullName}`);

                // Click Add Contact
                // Ensure we are on dashboard or can see the button
                if (!page.url().endsWith('/')) {
                    await page.goto(`${BASE_URL}/`);
                }

                // Click the "Add Contact" button
                await page.getByRole('button', { name: /add contact/i }).first().click();

                // Fill form
                await page.waitForSelector('form');
                await page.fill('#name', fullName);
                await page.fill('#phone', phone);
                await page.fill('#email', email);
                await page.fill('#address', `${Math.floor(Math.random() * 999)} Random St`);

                // Submit
                await page.getByRole('button', { name: /add contact/i, exact: true }).click(); // exact: true prevents matching the nav button if visible? 
                // Actually the form button text is likely "Add Contact" or "Save"
                // It's usually safer to target the submit button specifically or check the text in ContactForm.vue
                // In ContactForm.vue: <button type="submit" ...>{{ isEditing ? 'Update Contact' : 'Add Contact' }}</button>

                // Wait for success (redirection to dashboard or toast)
                await page.waitForURL('**/'); // It redirects to / after success

                // Optional: small pause to not overwhelm backend
                // await page.waitForTimeout(100); 

            } catch (err) {
                console.error(`Failed to add contact ${i}:`, err.message);
                // Try to recover by going back to dashboard
                await page.goto(`${BASE_URL}/`);
            }
        }

        console.log('Seeding completed!');

    } catch (error) {
        console.error('Script failed:', error);
    } finally {
        await browser.close();
    }
})();
