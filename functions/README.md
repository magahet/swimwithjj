# SwimWithJJ Firebase Functions

This directory contains Firebase Cloud Functions that power the backend of SwimWithJJ.

## Available Functions

### Email Functions
- **messageSend**: Sends an email notification when a user submits a message via the contact form
- **signupNew**: Processes new signup forms, creates a Stripe customer, and sends a confirmation email
- **signupChanged**: Sends lesson time emails when a signup status changes to "lessons scheduled"

### Marketing Functions
- **signupSubscribe**: Adds email addresses from new signups to a MailChimp marketing list
- **messageSubscribe**: Adds email addresses from contact form submissions to a MailChimp marketing list

## Environment Setup

### Environment Variables (.env file)

Create a `.env` file based on the `.env.example` template:

```
# Email settings
EMAIL_FROM=jj@swimwithjj.com
EMAIL_FROM_NAME=JJ
EMAIL_TO=jj@swimwithjj.com
EMAIL_TO_NAME=JJ

# Stripe
STRIPE_PUBLISH_KEY=pk_live_xxx
```

### Firebase Secrets (Secret Manager)

These sensitive values are managed using Firebase Secret Manager and should not be included in the `.env` file:

1. **Stripe Key**
   - Secret Name: `STRIPE_KEY`
   - Description: Private Stripe API key for payment processing

2. **Sendinblue API Key**
   - Secret Name: `SIB_API_KEY`
   - Description: API key for Sendinblue email service

3. **MailChimp Configuration**
   - Secret Name: `MAILCHIMP_API_KEY`
   - Description: API key for MailChimp marketing service (includes server prefix, e.g. "xxxx-us10")
   
   - Secret Name: `MAILCHIMP_LIST_ID`
   - Description: ID of the MailChimp audience/list

## Setting up Firebase Secrets

Use the Firebase CLI to set secrets:

```bash
firebase functions:secrets:set STRIPE_KEY
firebase functions:secrets:set SIB_API_KEY
firebase functions:secrets:set MAILCHIMP_API_KEY
firebase functions:secrets:set MAILCHIMP_LIST_ID
```

## Installation

Install dependencies:

```bash
cd functions
npm install
```

## Deployment

You can deploy all functions or specific functions:

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific functions
firebase deploy --only functions:signupNew,functions:signupChanged,functions:messageSend,functions:signupSubscribe,functions:messageSubscribe

# Deploy a single function
firebase deploy --only functions:signupNew
```

## Local Testing

Test functions locally using the Firebase emulator:

```bash
cd functions
npm run serve
```

## Function Dependencies

- **Firebase Admin SDK**: For Firestore database access
- **Firebase Functions v2**: For Cloud Functions infrastructure
- **Stripe**: For payment processing
- **Sendinblue**: For transactional emails
- **Mailchimp Marketing API**: For newsletter subscriptions

## Recommended Development Workflow

1. Make changes to functions
2. Test changes locally using emulators
3. Deploy to Firebase
4. Monitor logs for any errors:
   ```bash
   firebase functions:log
   ```

## Security Notes

- API keys and credentials should never be committed to version control
- Always use Firebase Secret Manager for sensitive credentials
- Review Firebase security rules regularly 