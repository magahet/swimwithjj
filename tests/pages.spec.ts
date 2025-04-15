import { test, expect } from '@playwright/test';

// Base URL for the application
const baseURL = 'http://localhost:4321'; // Astro's default dev server port

// Test home page
test('Home page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/`);

    // Verify page title
    await expect(page).toHaveTitle(/Home - Swim With JJ/);

    // Check that key elements are visible
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check main sections are visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check navigation links
    const navLinks = page.locator('nav a').first();
    await expect(navLinks).toBeVisible();

    // Verify responsive design (check body has flex layout)
    await expect(page.locator('body')).toHaveCSS('display', 'flex');

    // Check if important images are loaded (if any exist)
    const images = page.locator('img');
    const count = await images.count();
    if (count > 0) {
        await expect(images.first()).toBeVisible();
    }
});

// Test About page
test('About page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/about`);

    // Verify page title
    await expect(page).toHaveTitle(/About JJ - Swim With JJ/);

    // Check header and footer
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check main content
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();

    // Check for about content sections
    const contentSections = page.locator('main p');
    const sectionCount = await contentSections.count();
    if (sectionCount > 0) {
        await expect(contentSections.first()).toBeVisible();
    }

    // Check for images if present
    const images = page.locator('main img');
    const imageCount = await images.count();
    if (imageCount > 0) {
        await expect(images.first()).toBeVisible();
    }
});

// Test FAQ page
test('FAQ page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/faq`);

    // Verify page title
    await expect(page).toHaveTitle(/FAQ - Swim With JJ/);

    // Check header and footer
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check FAQ title
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();

    // Check if FAQ items are present using the correct selector for the current implementation
    const faqItems = page.locator('h3.text-maroon');
    const count = await faqItems.count();
    if (count > 0) {
        await expect(faqItems.first()).toBeVisible();
    } else {
        // If no h3.text-maroon exists, check for any h2 or h3 elements in the main content
        const altHeadings = page.locator('main h2, main h3');
        expect(await altHeadings.count()).toBeGreaterThan(0);
        await expect(altHeadings.first()).toBeVisible();
    }
});

// Test Testimonials page
test('Testimonials page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/testimonials`);

    // Verify page title
    await expect(page).toHaveTitle(/Testimonials - Swim With JJ/);

    // Check header and footer
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check testimonials heading
    await expect(page.getByRole('heading', { name: /testimonials/i })).toBeVisible();

    // Check testimonial items with proper selector
    const testimonials = page.locator('blockquote.blockquote');
    const count = await testimonials.count();
    if (count > 0) {
        await expect(testimonials.first()).toBeVisible();
    } else {
        // Fallback check for any blockquote or testimonial-like content
        const altTestimonials = page.locator('main blockquote, main .testimonial, main p.italic');
        expect(await altTestimonials.count()).toBeGreaterThan(0);
        await expect(altTestimonials.first()).toBeVisible();
    }
});

// Test Contact page
test('Contact page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/contact`);

    // Verify page title
    await expect(page).toHaveTitle(/Contact JJ - Swim With JJ/);

    // Check header and footer
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check contact heading
    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible();

    // Check if contact form is present without submitting it
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check form fields individually to avoid strict mode violations
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();

    // Verify submit button exists but don't click it
    await expect(page.locator('button[type="submit"]')).toBeVisible();
});

// Test Sign Up page
test('Sign Up page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/sign-up`);

    // Verify page title
    await expect(page).toHaveTitle(/Sign-Up - Swim With JJ/);

    // Check header and footer
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check sign up heading with the correct text
    await expect(page.getByRole('heading', { name: /Sign Up for Swim Lessons/i })).toBeVisible();

    // Check for signup content container
    const signupContent = page.locator('#signup-content');
    await expect(signupContent).toBeVisible();

    // The signup message will be present regardless of signup state
    const contentText = await signupContent.textContent();
    expect(contentText?.length).toBeGreaterThan(0);

    // Only test for the form if signup state is open or has admin preview
    const form = page.locator('form#signup-form');
    const formExists = await form.count() > 0;

    if (formExists) {
        await expect(form).toBeVisible();

        // Check some form fields if the form exists
        const nameInput = page.locator('#parent-name');
        if (await nameInput.count() > 0) {
            await expect(nameInput).toBeVisible();
        }
    } else {
        // If form doesn't exist, check for the closed or coming soon message
        const message = page.locator('.bg-gray-50, .bg-blue-50');
        await expect(message).toBeVisible();
    }
});

// Test Sign Up page with admin preview
test('Sign Up page with admin_preview shows the form regardless of signup state', async ({ page }) => {
    await page.goto(`${baseURL}/sign-up?admin_preview`);

    // Verify page title
    await expect(page).toHaveTitle(/Sign-Up - Swim With JJ/);

    // Check for admin preview banner
    const adminBanner = page.locator('div.bg-yellow-100.border-l-4.border-yellow-500');
    await expect(adminBanner).toBeVisible();
    await expect(adminBanner).toContainText('Admin Preview Mode');

    // Verify the signup form is visible with admin preview, regardless of signup state
    const signupForm = page.locator('form#signup-form');
    await expect(signupForm).toBeVisible();

    // Check form fields
    await expect(page.locator('#parent-name')).toBeVisible();
    await expect(page.locator('#parent-email')).toBeVisible();
    await expect(page.locator('#parent-phone')).toBeVisible();

    // Check child count radio buttons - use first child count radio button to avoid strict mode violation
    await expect(page.getByRole('radio', { name: '1' })).toBeVisible();

    // Check first child section fields
    await expect(page.locator('#child-name-1')).toBeVisible();
    await expect(page.locator('#child-birthday-1')).toBeVisible();
    await expect(page.locator('#child-level-1')).toBeVisible();

    // Check for add sessions button
    await expect(page.locator('.add-sessions-btn').first()).toBeVisible();
});

// Test Lesson Info page
test('Lesson Info page content and layout', async ({ page }) => {
    await page.goto(`${baseURL}/lesson-info`);

    // Verify page title
    await expect(page).toHaveTitle(/Lesson Info - Swim With JJ/);

    // Check header and footer with correct classes
    await expect(page.locator('header.bg-gray-900')).toBeVisible();
    await expect(page.locator('footer.bg-gray-100')).toBeVisible();

    // Check lesson info heading
    await expect(page.getByRole('heading', { name: /lesson info/i })).toBeVisible();

    // Check for content sections
    const contentSections = page.locator('main p, main div.bg-white');
    const count = await contentSections.count();
    expect(count).toBeGreaterThan(0);
    await expect(contentSections.first()).toBeVisible();

    // Check for any tables if they exist
    const tables = page.locator('table');
    const tableCount = await tables.count();
    if (tableCount > 0) {
        await expect(tables.first()).toBeVisible();
    }
});

// Test Lesson Info page with admin preview
test('Lesson Info page with admin_preview shows session information', async ({ page }) => {
    await page.goto(`${baseURL}/lesson-info?admin_preview`);

    // Verify page title
    await expect(page).toHaveTitle(/Lesson Info - Swim With JJ/);

    // Check for admin preview banner
    const adminBanner = page.locator('div.bg-yellow-100.border-l-4.border-yellow-500');
    await expect(adminBanner).toBeVisible();
    await expect(adminBanner).toContainText('Admin Preview Mode');

    // Check that sessions section is visible
    const sessionsSection = page.locator('#sessions-section');
    await expect(sessionsSection).toBeVisible();
    await expect(sessionsSection).not.toHaveClass(/hidden/);

    // Check for session container
    await expect(page.locator('#sessions-container')).toBeVisible();

    // Check for toggle button for closed sessions
    await expect(page.locator('#toggle-closed-sessions')).toBeVisible();

    // Wait for sessions to load and verify at least one is visible, or a message is shown
    await page.waitForTimeout(1000); // Allow time for session data to load

    // Either session cards or a "no sessions" message should be present
    const sessionCards = page.locator('#sessions-container div.bg-white');
    const noSessionsMessage = page.locator('#sessions-container p.text-gray-500');

    const cardCount = await sessionCards.count();
    const hasMessage = await noSessionsMessage.count() > 0;

    expect(cardCount > 0 || hasMessage).toBeTruthy();
}); 