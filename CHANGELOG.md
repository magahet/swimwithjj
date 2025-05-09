# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2024-07-20

### Changed
- Enhanced child information display in admin signup edit modal:
  - Changed display of date of birth (DOB) to show age in years and months
  - Added age calculation function that dynamically computes age from birthday
  - Improved readability of child information in the admin interface
  - Age calculation handles edge cases (leap years, month transitions)
  - Original date of birth is still stored in Firestore (display change only)

## [0.5.9] - 2024-07-18

### Added
- Enhanced MailChimp integration with tag support:
  - Added ability to tag subscribers with custom tags from environment variables
  - Implemented automatic tagging for both new and existing subscribers
  - Added tag support for both signup and contact form submissions
  - Created fallback handling for when tag is not defined

### Changed
- Improved MailChimp subscriber management with smarter tag handling
- Enhanced error handling for existing MailChimp subscribers
- Updated Cloud Functions configuration with environment variable support

## [0.5.8] - 2024-07-16

### Removed
- "Important Reminders" section from lesson times email templates:
  - Removed from both the actual email template in functions/signup-changed.js
  - Removed from the preview template in public/email-previews.html

## [0.5.7] - 2024-07-15

### Added
- Total Payment Summary section in the sign-up form:
  - Added payment summary UI with total amount display
  - Implemented dynamic price display for each session
  - Added JavaScript function to update total payment amount
  - Enhanced session selection display with price information

## [0.5.6] - 2024-07-14

### Fixed
- Accessibility issues with mobile navigation:
  - Added aria-label attribute to main navigation mobile toggle button
  - Added aria-label attribute to admin panel mobile toggle button
  - Improved screen reader support for navigation elements

### Added
- Form testing documentation and new test files:
  - Added README-FORM-TESTS.md with form testing instructions
  - Added form-submit.spec.ts for form submission tests
  - Added test utilities for better test organization

## [0.5.5] - 2024-07-12

### Fixed
- Accessibility issues in sign-up form and session modal:
  - Improved color contrast on all buttons (Add Sessions, Save Selections, Submit Registration) to meet WCAG 2.0 AA standard
  - Added proper labeling for the comments/requests textarea
  - Enhanced modal dialog with proper ARIA attributes (role, aria-modal, aria-labelledby)
  - Improved keyboard accessibility including focus trap for modal dialog
  - Added keyboard event handling for Escape key to close modals
  - Implemented proper focus management when opening/closing the modal
  - Added aria-label for the modal close button
  - Improved session checkboxes with proper labeling and keyboard support

### Changed
- Updated button colors from blue-500/600 to blue-700/800 for better contrast
- Added aria attributes to form elements for better screen reader support
- Improved test organization and removed temporary test files
- Streamlined test execution and reporting

### Removed
- Deleted example.spec.ts and debug.spec.ts test files

## [0.5.4] - 2024-07-10

### Added
- Playwright testing framework for automated tests
- Accessibility tests with axe-core integration
- Visual regression tests for key pages
- Navigation flow tests for user journey verification
- Basic page content tests for correctness
- New npm scripts for running various test suites
- Screenshots directory to .gitignore

### Changed
- Improved accessibility: added underline to links in FAQ page
- Enhanced visual styling with consistent headings on homepage
- Improved map accessibility with proper title attribute
- Darkened maroon color in CSS variables for better contrast
- Added proper styling classes to "Learn More" button

### Fixed
- Map iframe missing closing attributes

## [0.5.3] - 2024-07-08

### Added
- Admin preview mode for sign-up forms via URL parameter
- Admin banner notification when viewing in preview mode
- URL parameter detection for displaying sign-up forms to admins

### Changed
- Improved form initialization with additional error handling
- Enhanced DOM event listeners with null checks for better stability
- Restructured sign-up form HTML for better maintainability

### Fixed
- Sign-up form JavaScript to handle dynamically loaded content
- Event listener initialization for dynamically created elements
- Form display logic to support admin preview mode

## [0.5.2] - 2024-07-01

### Added
- Placeholder hints to session creation form fields for better UX
- Dynamic sign-up availability states (open, coming soon, closed)
- Condition-based rendering for sign-up page based on site settings

### Changed
- Updated package name to "swimwithjj" in package.json and package-lock.json
- Improved code organization in sign-up page with conditional rendering
- Enhanced form field clarity with descriptive placeholders

### Fixed
- Sign-up form code reorganization for better maintainability
- Early exit in sign-up JavaScript when form isn't available

## [0.5.1] - 2024-06-28

### Added
- Enhanced HTML email templates for contact form submissions
- Modern responsive email layout for signup confirmations
- Improved email templates for lesson schedule notifications
- Email preview access in admin dashboard

### Changed
- Email message formatting with better visual hierarchy
- Updated Firebase functions to support HTML email content
- Improved admin dashboard's Messages section UI

### Fixed
- Email formatting issues in notification emails
- Missing copyright year in email templates
- Admin navigation link consistency

## [0.5.0] - 2024-06-25

### Added
- Contact form functionality with Firestore integration
- Custom document ID generation for both signups and contact form submissions
- Improved admin interface for signup management with enhanced filtering
- Direct session time update capability in admin interface
- Pagination for signup listings in admin dashboard
- Loading indicators and better error handling throughout the application

### Changed
- Modernized signup data handling with more robust error handling
- Enhanced child registration form with date of birth instead of age
- Updated swimming level options to be more descriptive
- Improved admin dashboard with more comprehensive signup search capabilities
- Better form validation on signup and contact forms

### Fixed
- Error handling in session management functionality
- Layout issues in admin interface for various screen sizes
- Improved function detection for compatibility with different module structures

## [0.4.0] - 2025-04-10

### Added
- Modern Stripe integration with Payment Methods API
- New stripeClient.js module for frontend Stripe Elements integration
- Customer search functionality in signup-new Firebase function
- Direct links to Stripe customer dashboard in admin interface

### Changed
- Upgraded Stripe from v8 to v18
- Replaced token-based payment with modern payment methods
- Improved payment UI with Stripe Elements
- Enhanced error handling for payment processing
- Updated data schema to use paymentMethodId instead of token

### Fixed
- Date formatting in admin signup details modal
- Improved date display in admin interface for various timestamp formats

## [0.3.0] - 2024-04-10

### Added
- Firebase Cloud Functions for backend processing
- Email notification system for signups and contact form
- MailChimp integration for marketing subscriptions

### Changed
- Moved Stripe public key to environment variable

### Fixed
- Hardcoded API keys replaced with environment variables

## [0.2.0] - 2024-11-21

### Added
- Dynamic session management in lesson-info page
- Interactive session selection in sign-up form
- Multiple children registration support
- Toggle for showing/hiding closed sessions
- Session data fetching from Firestore

### Changed
- Reduced map height on lesson-info page for better page balance
- Improved responsive design for session display
- Enhanced sign-up form with dynamic session selection modal
- Updated styling for better user experience

### Fixed
- Layout issues in the lesson information page
- Nested element structure in sign-up form

## [0.1.0] - 2024-11-19

### Added
- Firebase authentication integration
- Admin dashboard and authentication
- Settings management functionality
- Multiple setup guide documentation:
  - Firebase Setup Guide
  - Admin Authentication Setup
  - Firestore Manual Setup
  - Service Account Setup
  - Sessions Collection Setup
- Admin components:
  - AdminAuth
  - AdminNav
  - FirebaseAuth
  - FirebaseFirestore
  - FirebaseProvider
  - FirebaseStorage
  - SettingsAdmin
  - SettingsManager
- Admin layout template
- Firebase library utilities
- Environment variables example file

### Changed
- Updated README with admin section documentation
- Improved Layout component for admin functionality
- Updated package dependencies
- Enhanced .gitignore rules

### Fixed
- Initial configuration issues
- Package version conflicts

## [0.0.1] - 2024-11-18

### Added
- Initial project setup with Astro
- Basic site structure and layout
- Core pages and components 