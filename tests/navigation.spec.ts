import { test, expect } from '@playwright/test';

// Base URL for the application
const baseURL = 'http://localhost:4321'; // Astro's default dev server port

// Test navigation components and functionality
test('Header navigation links should work correctly', async ({ page }) => {
    await page.goto(`${baseURL}/`);

    // Wait for navigation to be visible
    const header = page.locator('header.bg-gray-900');
    await expect(header).toBeVisible();

    // Find all navigation links in the desktop navigation
    const links = page.locator('header nav.hidden.md\\:block a');
    const count = await links.count();

    // Store URLs to check they're all different
    const urls = new Set<string>();
    let navigationCount = 0;

    // Check each navigation link without submitting forms
    for (let i = 0; i < count; i++) {
        const link = links.nth(i);

        // Get the URL this link points to
        const href = await link.getAttribute('href');
        if (!href) continue;

        // Skip if the link points to the current page
        if (href === '/' && page.url().endsWith('/')) continue;

        // Skip external links
        if (href.startsWith('http') && !href.includes(baseURL)) continue;

        // Skip if the link is not visible or has event handlers that might submit forms
        const shouldSkip = await link.evaluate(el => {
            return window.getComputedStyle(el).display === 'none' ||
                el.classList.contains('submit') ||
                el.getAttribute('type') === 'submit' ||
                el.getAttribute('href')?.includes('#') ||
                el.getAttribute('href') === '';
        });

        if (shouldSkip) continue;

        // Add to our collection of URLs
        urls.add(href);

        // Get the current URL for later comparison
        const currentUrl = page.url();

        // Click the link
        await link.click();

        // Wait for navigation to complete
        await page.waitForLoadState('domcontentloaded');

        // Verify we've navigated to a new page
        // Only run this assertion if we're not on the homepage
        if (href !== '/') {
            expect(page.url()).not.toBe(currentUrl);
            navigationCount++;
        }

        // Go back for the next iteration
        await page.goBack();
        await page.waitForLoadState('domcontentloaded');
    }

    // Verify that we found multiple different pages through navigation or at least some navigation happened
    expect(urls.size).toBeGreaterThan(0);
    expect(navigationCount).toBeGreaterThan(0);
});

// Test footer presence and links
test('Footer should be present on all pages with consistent content', async ({ page }) => {
    // Pages to check
    const pages = ['/', '/about', '/faq', '/testimonials', '/contact', '/sign-up', '/lesson-info'];

    // First load the homepage to get reference footer content
    await page.goto(`${baseURL}${pages[0]}`);

    // Check footer exists - use specific selector to avoid strict mode violation
    const footer = page.locator('footer.bg-gray-100');
    await expect(footer).toBeVisible();

    // Get reference footer content
    const referenceContent = await footer.textContent();

    // Check footer on other pages
    for (let i = 1; i < pages.length; i++) {
        await page.goto(`${baseURL}${pages[i]}`);

        // Check footer exists
        await expect(footer).toBeVisible();

        // Check content is consistent
        const currentContent = await footer.textContent();
        expect(currentContent).toBe(referenceContent);

        // Check that links in footer are visible
        const footerLinks = page.locator('footer.bg-gray-100 a');
        const linkCount = await footerLinks.count();
        for (let j = 0; j < linkCount; j++) {
            await expect(footerLinks.nth(j)).toBeVisible();
        }
    }
});

// Test mobile navigation menu if it exists
test('Mobile navigation menu should work correctly', async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${baseURL}/`);

    // Look for mobile menu button with correct ID
    const mobileMenuButton = page.locator('#menu-toggle');
    await expect(mobileMenuButton).toBeVisible();

    // Check if mobile menu is initially hidden
    const mobileNav = page.locator('#mobile-menu');

    // Get visibility state before clicking - use computed style since the element exists but is hidden
    const isInitiallyVisible = await mobileNav.evaluate(el => {
        return window.getComputedStyle(el).display !== 'none';
    });

    // Click the mobile menu button
    await mobileMenuButton.click();

    // Wait a moment for any animations
    await page.waitForTimeout(300);

    // Check if visibility changed
    const isNowVisible = await mobileNav.evaluate(el => {
        return window.getComputedStyle(el).display !== 'none';
    });

    // Visibility should have changed
    expect(isNowVisible).not.toBe(isInitiallyVisible);

    // If the menu is now visible, check that links are visible too
    if (isNowVisible) {
        const mobileNavLinks = page.locator('#mobile-menu a');
        const linkCount = await mobileNavLinks.count();

        // Should have at least one link
        expect(linkCount).toBeGreaterThan(0);

        // Check that links are visible
        for (let i = 0; i < linkCount; i++) {
            await expect(mobileNavLinks.nth(i)).toBeVisible();
        }
    }
});

// Test for consistent branding elements across pages
test('Branding elements should be consistent across pages', async ({ page }) => {
    // Pages to check
    const pages = ['/', '/about', '/faq', '/testimonials', '/contact', '/sign-up', '/lesson-info'];

    // Elements to check for consistency - using specific selectors
    const elements = {
        siteName: 'header a.text-2xl'
    };

    // Store reference elements from first page
    const references: Record<string, string> = {};

    // Load the first page to get references
    await page.goto(`${baseURL}${pages[0]}`);

    for (const [elementName, selector] of Object.entries(elements)) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
            // For text elements, store the text content
            references[elementName] = await element.textContent() || '';
        }
    }

    // Check other pages for consistency
    for (let i = 1; i < pages.length; i++) {
        await page.goto(`${baseURL}${pages[i]}`);

        for (const [elementName, selector] of Object.entries(elements)) {
            const element = page.locator(selector);

            if (await element.count() > 0 && references[elementName]) {
                // For text elements, check the text content
                const text = await element.textContent() || '';
                expect(text).toBe(references[elementName]);
            }
        }
    }
});

// Test admin preview functionality and navigation between admin preview pages
test('Admin preview banner should be consistent across admin preview pages', async ({ page }) => {
    // Start with lesson info page with admin preview
    await page.goto(`${baseURL}/lesson-info?admin_preview`);

    // Check for admin preview banner
    const adminBanner = page.locator('div.bg-yellow-100.border-l-4.border-yellow-500');
    await expect(adminBanner).toBeVisible();
    await expect(adminBanner).toContainText('Admin Preview Mode');

    // Check for session information visibility (which requires admin_preview)
    await expect(page.locator('#sessions-section')).toBeVisible();

    // Navigate directly to sign-up page with admin preview
    await page.goto(`${baseURL}/sign-up?admin_preview`);
    await page.waitForLoadState('domcontentloaded');

    // Check admin banner is present on sign-up page
    await expect(adminBanner).toBeVisible();
    await expect(adminBanner).toContainText('Admin Preview Mode');

    // Check that sign-up form is visible (which requires admin_preview if signup is closed)
    await expect(page.locator('form#signup-form')).toBeVisible();
}); 