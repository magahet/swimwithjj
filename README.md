# Swim With JJ - Website

This repository contains the website for Swim With JJ, a swimming instruction service. The site is built using Astro, a modern static site generator.

## 🏊‍♀️ Site Overview

Swim With JJ is a swimming lesson business that offers personalized instruction with a focus on water safety and skill development. This website provides information about the services, lesson details, testimonials, FAQ, and contact information.

## 📋 Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for a detailed list of changes between versions.

## 🚀 Architecture

The site is built with [Astro](https://astro.build/), a modern static site generator, with TailwindCSS for styling. It follows a standard Astro project structure:

```
/
├── public/            # Static assets (images, favicon)
├── src/
│   ├── assets/        # Source assets that need processing
│   ├── components/    # Reusable UI components
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   └── Welcome.astro
│   ├── layouts/       # Page layouts
│   │   └── Layout.astro
│   │   └── AdminLayout.astro  # Admin pages layout with authentication
│   ├── lib/           # Utility functions and services
│   │   └── firebase.ts # Firebase configuration
│   │   └── firebaseClient.ts # Firebase utility functions
│   │   └── initSettings.ts # Settings initialization
│   │   └── sessionManager.ts # Session management utilities
│   │   └── stripeClient.js # Stripe payment integration
│   ├── pages/         # Each .astro file becomes a route
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── faq.astro
│   │   ├── lesson-info.astro
│   │   ├── sign-up.astro
│   │   ├── testimonials.astro
│   │   └── admin/     # Admin section with authentication
│   └── styles/        # Global styles
│       └── global.css
├── package.json
├── astro.config.mjs
├── tailwind.config.js
└── tsconfig.json
```

### Key Components

- **Navigation**: The main menu bar with a dark background, providing access to all main sections
- **Layout**: The base layout that wraps all pages, with options for full-width hero images
- **Pages**: Individual content pages, each with their specific content and layout variations
- **Firebase**: Backend services for authentication, database, and storage
- **Admin Area**: Protected admin dashboard with settings management
- **Session Management**: Dynamic display and selection of lesson sessions
- **Sign-up Form**: Interactive form with support for multiple children and session selection
- **Payment Processing**: Modern Stripe integration for secure payment handling

## 💻 Development

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase project (for backend services)
- Stripe account (for payment processing)

### Setup & Installation

1. Clone this repository
```bash
git clone https://github.com/magahet/swimwithjj-astro.git
cd swimwithjj-astro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy the `.env.example` file to `.env`
   - Fill in your Firebase project details in the `.env` file

4. Start the development server
```bash
npm run dev
```

This will start the development server at `http://localhost:4321`

### Firebase Setup

For detailed instructions on setting up Firebase, please see the [Firebase Setup Guide](FIREBASE_SETUP.md).

#### Session Management

The site features dynamic session management:
1. Sessions are stored in Firestore and can be managed through the admin interface
2. Open sessions are automatically displayed on the lesson information page
3. The sign-up form allows parents to select specific sessions for each child

### Admin Authentication

The admin area is protected with Firebase Authentication. To set up admin access:

1. Enable Email/Password authentication in your Firebase project
2. Create admin user accounts in Firebase Authentication
3. Use these credentials to access the admin area at `/admin`

For detailed instructions, see the [Admin Authentication Setup Guide](ADMIN_AUTH_SETUP.md).

### Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## 🖥️ Deployment

The site is designed to be deployed as a static site. After building with `npm run build`, the `dist` directory contains all the files needed for deployment.

### Deployment Options:

- Netlify
- Vercel
- GitHub Pages
- Any static site hosting service

### Firebase Setup:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable the services you need (Authentication, Firestore, Storage)
3. Add your Firebase configuration to the `.env` file

### Firebase Functions:

The project includes Firebase Cloud Functions for backend operations:
- Email notifications for signups and contact form submissions
- MailChimp integration for marketing subscriptions
- Session data processing
- Stripe payment processing

To deploy the functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

See the [functions/README.md](functions/README.md) file for detailed setup instructions.

### Payment Processing

The website uses Stripe for payment processing with a modern implementation:

#### Payment Workflow

1. **Frontend (Sign-Up Form)**:
   - Uses Stripe Elements for secure card collection
   - Collects parent information, child details, and selected sessions
   - Creates a Payment Method using Stripe's API
   - Submits form data with Payment Method ID to Firestore

2. **Backend (Firebase Function)**:
   - Triggered when a new signup document is created
   - Searches for existing customer with the same email
   - If found: attaches the new payment method to the existing customer
   - If not found: creates a new Stripe customer with the payment method
   - Updates the signup document with the Stripe customer ID
   - Sends confirmation email to the customer

3. **Admin Interface**:
   - Displays signup details including payment information
   - Provides a direct link to the Stripe customer dashboard
   - Allows administrators to update signup status (which can trigger payment charging)
   - When status is changed to "lessons scheduled", an email notification is sent

This implementation follows Stripe's best practices by using the Payment Methods API instead of the legacy Tokens API, providing better security, reusability, and support for SCA/3D Secure requirements.

## 🎨 Design

The site uses a clean, modern design with:

- A dark navigation bar
- Full-width hero section for the homepage
- Responsive layout for all device sizes
- Swimming-themed images and colors

## 🔧 Customization

- **Colors**: Main colors are defined in the TailwindCSS configuration
- **Layout**: Page layouts can be modified in the `src/layouts` directory
- **Content**: Page content is managed in individual `.astro` files in the `src/pages` directory
- **Components**: Reusable components are in the `src/components` directory
- **Firebase**: Firebase services configuration in `src/lib/firebase.ts`
- **Admin**: Admin interface components in `src/pages/admin` directory

## 📝 License

All rights reserved, SwimWithJJ © 2024
