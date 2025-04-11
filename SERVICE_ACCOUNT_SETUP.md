# Firebase Service Account Setup

To create the settings collection in Firestore, you'll need to use the Firebase Admin SDK with a service account key. Follow these steps:

## 1. Get a Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (swimwithjj-f6a63)
3. Click on the ⚙️ gear icon in the top left and select "Project settings"
4. Go to the "Service accounts" tab
5. Click "Generate new private key" button
6. Click "Generate key" in the confirmation dialog
7. Save the downloaded JSON file as `serviceAccountKey.json` in your project root

## 2. Secure Your Service Account Key

The service account key grants full administrative access to your Firebase project. Treat it as a sensitive credential:

- **DO NOT commit it to version control**
- Add `serviceAccountKey.json` to your `.gitignore` file
- Store it securely and restrict access to it
- Consider using a secret management solution for production environments

## 3. Run the Admin Initialization Script

With your service account key in place, run the admin initialization script:

```bash
node src/scripts/admin-init-settings.js
```

This script will:
1. Load your service account key
2. Initialize the Firebase Admin SDK with full privileges
3. Create the settings collection and config document in Firestore
4. Log the results to the console

## 4. Verify the Settings

After running the script, check that your settings have been created:

1. Go to the Firebase Console
2. Select "Firestore Database" from the left sidebar
3. You should see a "settings" collection with a "config" document
4. The document should contain your default settings:
   - signupState: "closed"
   - lessonInfoActive: false
   - processStates: array of strings
   - stripePublishKey: your Stripe key

## 5. Next Steps

After successfully creating the settings:

1. Remove or securely store the service account key file
2. Test the admin interface at `/admin` to make sure it can read and write to the settings
3. Set up proper security rules for the Firestore database

## Troubleshooting

If you encounter errors:

1. **Permission Denied**: Make sure the service account has the necessary permissions. In the Firebase Console, go to Project Settings > Service accounts and check the role (it should be "Firebase Admin").

2. **File Not Found**: Ensure the `serviceAccountKey.json` file is in the project root directory and named exactly as expected.

3. **Format Errors**: The service account key must be a valid JSON file. If you edited it, make sure it's still valid JSON.

4. **Project ID Mismatch**: Verify that the project ID in the service account key matches your Firebase project ID. 