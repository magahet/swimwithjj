# Sessions Collection Setup in Firestore

This document explains how to set up the sessions collection in Firestore for the Swim With JJ application.

## About Sessions

Sessions are individual swimming lesson periods with specific:
- Pricing 
- Dates
- Days of the week
- Time slots
- Open/closed status

The sessions collection is used to display available sessions on the signup form and is managed through the admin interface.

## Prerequisites

Before you set up the sessions collection, make sure you have:

1. Set up the `settings` collection as described in `FIRESTORE_MANUAL_SETUP.md`
2. Created a service account key as described in `SERVICE_ACCOUNT_SETUP.md`
3. Placed the `serviceAccountKey.json` file in the project root

## Automatic Setup (Recommended)

The easiest way to set up the sessions collection is to run the admin script:

```bash
node src/scripts/admin-create-sessions.js
```

This script will:
1. Load the service account key
2. Connect to Firestore with admin privileges
3. Create a new `sessions` collection
4. Add the session documents with the data from the old `settings.json` file
5. Log the results to the console

## Manual Setup (Alternative)

If you prefer to set up the sessions collection manually:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (swimwithjj-f6a63)
3. In the left sidebar, click on "Firestore Database"
4. Click "Start collection" (or "Add collection" if you already have other collections)
5. For Collection ID, enter: `sessions`
6. Click "Next"

7. For each session, create a document with:
   - Document ID: The session number (e.g. "1", "2", etc.)
   - Fields:
     | Field Name | Type    | Description                            |
     |------------|---------|----------------------------------------|
     | id         | string  | Unique identifier (same as doc ID)     |
     | open       | boolean | Whether registration is open           |
     | price      | number  | Cost of the session                    |
     | dates      | string  | Range of dates (e.g. "May 28-June 13") |
     | days       | string  | Days of the week                       |
     | times      | string  | Time slots available                   |
     | notes      | string  | (Optional) Additional information      |
     | createdAt  | timestamp | When the document was created        |
     | updatedAt  | timestamp | When the document was last updated   |

8. Click "Save" for each document

## Security Rules

Update your Firestore security rules to allow access to the sessions collection:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to sessions for all users
    match /sessions/{sessionId} {
      allow read: if true;
    }
    
    // Allow write access to sessions only for authenticated users
    match /sessions/{sessionId} {
      allow write: if request.auth != null;
    }
    
    // Other existing rules...
  }
}
```

## Verification

After setting up the sessions:

1. Visit your website
2. Navigate to the signup form (if it's enabled)
3. You should see the open sessions displayed as options
4. Log in to the admin interface to verify you can view, edit, and manage the sessions

## Sessions Data Structure

In the old `settings.json` file, sessions were stored in an array. Now, they're stored as individual documents in Firestore for better scalability and easier management.

The `dateList` field from the old data format has been intentionally omitted as per requirements. 