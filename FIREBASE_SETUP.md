# Firebase Setup Guide

This guide will help you set up Firebase for the Swim With JJ website.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new Firebase project
3. Name your project (e.g., "Swim With JJ")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Register Your Web App

1. From the Firebase project dashboard, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "Swim With JJ Web")
3. (Optional) Check "Also set up Firebase Hosting"
4. Click "Register app"
5. You'll see your Firebase configuration. Copy this information to use in the next step

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project by copying the `.env.example` file
2. Fill in the Firebase configuration variables with the values from the previous step:

```
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
PUBLIC_FIREBASE_APP_ID=your-app-id
PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Step 4: Enable Firebase Services

### Authentication

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable the authentication methods you want to use (e.g., Email/Password, Google, etc.)
3. If using Email/Password, consider enabling "Email link (passwordless sign-in)"

### Firestore Database

1. Go to "Firestore Database" > "Create database"
2. Choose either "Production mode" or "Test mode" (you can change this later)
3. Select a location for your database (choose one close to your users)
4. Click "Enable"
5. Set up Firestore security rules as needed in the "Rules" tab

### Storage

1. Go to "Storage" > "Get started"
2. Read and accept the terms
3. Choose a location for your storage bucket
4. Click "Done"
5. Set up Storage security rules as needed in the "Rules" tab

## Step 5: Deploy Firebase Security Rules

For production use, you should set up proper security rules for Firestore and Storage. Here are some basic examples:

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to create, update, delete their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Additional rules for other collections...
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to upload their own files
    match /users/{userId}/{allPaths=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Testing Firebase Integration

1. Start your development server:
```bash
npm run dev
```

2. Open your browser console to see if Firebase is initialized successfully
3. Test authentication, database operations, and storage as needed

## Step 7: Deploy to Production

When deploying to production:

1. Ensure all Firebase security rules are properly configured
2. Make sure sensitive information is not exposed in client-side code
3. Consider using Firebase Functions for server-side operations if needed

## Firebase Components

This project includes several Firebase utility components:

- `FirebaseProvider.astro`: Initializes the Firebase app
- `FirebaseAuth.astro`: Provides authentication functionality
- `FirebaseFirestore.astro`: Provides Firestore database functionality
- `FirebaseStorage.astro`: Provides Storage functionality

These components are ready to use but don't add any visible UI by default. You can extend them or create additional components that use the Firebase services.

## Utility Functions

The project includes utility functions for common Firebase operations:

- Authentication: `signIn()`, `signUp()`, `signOut()`, `getCurrentUser()`
- Firestore: `createDocument()`, `updateDocument()`, `deleteDocument()`, `getDocument()`, `getDocuments()`, `queryDocuments()`
- Storage: `uploadFile()`, `deleteFile()`

These functions are available in the `src/lib/firebaseClient.ts` file.

## Global Helpers

The project also includes global helpers for Firebase operations:

- `window.firebaseUpload()`: Upload a file to Firebase Storage
- `window.firebaseDB.create()`: Create a document in Firestore
- `window.firebaseDB.get()`: Get a document from Firestore

These helpers are defined in the Firebase component files and can be used in client-side scripts. 