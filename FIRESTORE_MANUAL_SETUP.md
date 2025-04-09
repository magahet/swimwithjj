# Manual Firestore Settings Setup

Since we encountered a permissions error with the script, here's how to manually set up the settings collection in Firestore:

## Steps to Create Settings Collection

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (swimwithjj-f6a63)
3. In the left sidebar, click on "Firestore Database"
4. Click "Create database" if you haven't already set up Firestore
   - Choose "Start in production mode" (recommended)
   - Select a location close to your users
   - Click "Enable"

5. Once Firestore is enabled, click "Start collection"
6. For Collection ID, enter: `settings`
7. Click "Next"

8. For the first document:
   - Document ID: `config`
   - Add the following fields:

     | Field Name       | Type    | Value                                 |
     |------------------|---------|---------------------------------------|
     | signupState      | string  | closed                                |
     | lessonInfoActive | boolean | false                                 |
     | stripePublishKey | string  | pk_live_mfTxbsnXY6f9fXZJAR17EajZ      |

9. For the `processStates` field:
   - Field name: `processStates`
   - Type: array
   - Add these values (type: string):
     - `signup form received`
     - `lessons scheduled`

10. Click "Save" to create the document

## Security Rules

You may need to update your Firestore security rules to allow read/write access. Here's a basic rule to start with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to settings for all users
    match /settings/{document=**} {
      allow read: if true;
    }
    
    // Allow write access to settings only for authenticated users
    match /settings/{document=**} {
      allow write: if request.auth != null;
    }
    
    // Add more rules for other collections as needed
  }
}
```

To set these rules:
1. In the Firebase Console, go to Firestore Database
2. Click on the "Rules" tab
3. Replace the default rules with the ones above
4. Click "Publish"

## Testing

After you've created the settings collection and document:

1. You can test by visiting your website
2. Open the browser console and check if the settings are loaded (you should see "Site settings loaded:" in the console)
3. Visit the admin settings page (after logging in) at `/admin/settings` to manage these settings

## Troubleshooting

If you continue to encounter permission issues:

1. Make sure your Firebase Authentication is properly set up
2. Check your Firestore rules to ensure they allow appropriate access
3. Verify that your Firebase project settings match those in your `.env` file
4. Consider initializing Firebase with admin privileges for server-side operations 