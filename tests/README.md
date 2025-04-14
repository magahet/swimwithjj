# Playwright Tests for Swim with JJ

This directory contains automated UI tests for the Swim with JJ website using Playwright.

## Test Categories

The tests are organized into several categories:

1. **Basic Page Tests** (`pages.spec.ts`): Tests the content, layout, and structure of each page without submitting forms.
2. **Visual Tests** (`visual.spec.ts`): Tests visual elements, layout consistency, and responsive design across different viewport sizes.
3. **Accessibility Tests** (`accessibility.spec.ts`): Validates accessibility compliance using axe-core, including keyboard navigation, focus indicators, color contrast, and more.
4. **Navigation Tests** (`navigation.spec.ts`): Tests navigation components, links between pages, and consistency of branding elements.

## Running the Tests

Before running tests, make sure to start the development server:

```bash
npm run dev
```

Then in a separate terminal, you can run the tests using one of the following commands:

### Running All Tests

```bash
npm test
```

### Running Test UI Mode

```bash
npm run test:ui
```

### Running Specific Test Categories

```bash
# Run page content tests
npm run test:pages

# Run visual tests
npm run test:visual

# Run accessibility tests
npm run test:a11y

# Run navigation tests
npm run test:nav
```

### Viewing Test Reports

After tests have run, you can view the HTML report with:

```bash
npm run test:report
```

## Test Screenshots

The visual tests generate screenshots for different viewport sizes in the `screenshots` directory. These can be used for visual comparison or documentation.

## Notes

- Tests are configured to run on `http://localhost:4321`, make sure your Astro dev server is running on this port.
- No forms are submitted in these tests; they only validate that form elements are present and properly styled.
- The tests are designed to be resilient to minor DOM changes by using multiple selector strategies. 