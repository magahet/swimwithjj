# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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