# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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