# Admin Authentication Setup Guide

This guide explains how to set up Firebase Authentication for your Swim With JJ admin area.

## Setting Up Firebase Authentication

1. **Enable Authentication in Firebase Console**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Select your project (swimwithjj-f6a63)
   - In the left sidebar, click on "Authentication"
   - Click "Get started" if you haven't enabled it yet
   - Go to the "Sign-in method" tab

2. **Enable Email/Password Authentication**
   - Click on "Email/Password" in the providers list
   - Toggle the "Enable" switch to on
   - Click "Save"

3. **Create Admin User**
   - Go to the "Users" tab in Authentication
   - Click "Add user"
   - Enter the email and password for your admin account
   - Click "Add user" to create the account

## Testing Admin Access

1. **Access the Admin Area**
   - Visit your website at `/admin` (e.g., https://yoursite.com/admin)
   - You will see the admin login form
   - Enter the email and password you created
   - Click "Sign In"

2. **Verify Admin Functionality**
   - After signing in, you should have access to all admin features
   - Test the settings management page
   - Make sure you can sign out and that protected content is hidden when signed out

## Adding Additional Administrators

To add more administrators:

1. Go to the Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter the email and password for the new admin
4. Click "Add user"

The new user will immediately have access to the admin area using these credentials.

## Security Best Practices

1. **Use Strong Passwords**
   - Ensure all admin accounts use strong, unique passwords
   - Consider using a password manager

2. **Regular Review**
   - Periodically review the list of admin users
   - Remove any accounts that no longer need access

3. **Optional: Add Multi-Factor Authentication**
   - For additional security, consider enabling multi-factor authentication in Firebase
   - Go to Authentication > Sign-in method > Multi-factor authentication
   - Click "Enable" and follow the instructions

## Customizing Admin Access

The current implementation grants full admin access to anyone who can log in. For more granular control:

1. **Create Admin Roles in Firestore**
   - Create a "roles" collection in Firestore
   - Store user IDs with specific role permissions

2. **Modify the Admin Interface**
   - Update the admin components to check for specific roles
   - Show/hide features based on the user's assigned roles

3. **Update Security Rules**
   - Modify your Firestore security rules to check for specific roles
   - Example:
     ```
     match /settings/{document} {
       allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.isAdmin == true;
     }
     ```

## Troubleshooting

**Cannot Log In**
- Verify the email and password are correct
- Check that Authentication is properly enabled in Firebase
- Ensure your Firebase configuration is correct in your `.env` file

**Access Denied After Login**
- Check the browser console for any error messages
- Verify that the admin pages are correctly checking authentication state
- Test with a new admin account to rule out account-specific issues

**Other Issues**
- Enable Firebase Authentication debug mode in the console:
  ```javascript
  import { getAuth, connectAuthEmulator } from "firebase/auth";
  const auth = getAuth();
  connectAuthEmulator(auth, "http://localhost:9099");
  ```
- Check Firebase Authentication logs in the Firebase Console 