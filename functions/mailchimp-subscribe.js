const { logger } = require('firebase-functions/v2');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const mailchimp = require('@mailchimp/mailchimp_marketing');

// Define secrets for MailChimp
const mailchimpApiKey = defineSecret('MAILCHIMP_API_KEY');
const mailchimpListId = defineSecret('MAILCHIMP_LIST_ID');

/**
 * Get email from Firestore document based on collection
 * @param {Object} data - The Firestore document data
 * @param {string} collection - The collection name
 * @returns {string|null} - The email address or null if not found
 */
function getEmail(data, collection) {
    try {
        // Data structure differs between collections
        if (collection === 'messages') {
            return data.email;
        } else if (collection === 'signups') {
            return data.parent.email;
        }
        return null;
    } catch (error) {
        logger.error(`Error extracting email from ${collection} document:`, error);
        return null;
    }
}

/**
 * Extract the server prefix from a MailChimp API key
 * @param {string} apiKey - The MailChimp API key
 * @returns {string} - The server prefix (e.g., 'us10')
 */
function getServerFromApiKey(apiKey) {
    // API keys are in the format: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us10
    const parts = apiKey.split('-');
    if (parts.length === 2) {
        return parts[1];
    }
    logger.error('Invalid MailChimp API key format. Cannot extract server prefix.');
    return '';
}

/**
 * Subscribe an email to the MailChimp list
 * @param {Object} event - The Firestore trigger event
 * @param {string} collection - The collection name
 */
async function subscribeToMailchimp(event, collection) {
    const data = event.data.data();
    const email = getEmail(data, collection);

    if (!email) {
        logger.error(`Could not find email in ${collection} document`);
        return;
    }

    try {
        logger.info(`Adding email to MailChimp list: ${email}`);

        const apiKey = mailchimpApiKey.value();
        const server = getServerFromApiKey(apiKey);

        if (!server) {
            throw new Error('Could not determine MailChimp server from API key');
        }

        // Configure the MailChimp client
        mailchimp.setConfig({
            apiKey: apiKey,
            server: server,
        });

        // Add member to list
        const response = await mailchimp.lists.addListMember(mailchimpListId.value(), {
            email_address: email,
            status: 'subscribed',
        });

        logger.info(`Successfully added ${email} to MailChimp list:`, response);
    } catch (error) {
        // Handle errors from MailChimp API (e.g., member already exists)
        if (error.status === 400 && error.response && error.response.body &&
            error.response.body.title === 'Member Exists') {
            logger.info(`Email ${email} is already subscribed to the MailChimp list`);
        } else {
            logger.error(`Error adding ${email} to MailChimp list:`, error);
        }
    }
}

// Export Cloud Functions for message and signup collections
exports.signupSubscribe = onDocumentCreated({
    document: 'signups/{uid}',
    secrets: [mailchimpApiKey, mailchimpListId],
    region: 'us-central1',
}, async (event) => {
    await subscribeToMailchimp(event, 'signups');
});

exports.messageSubscribe = onDocumentCreated({
    document: 'messages/{uid}',
    secrets: [mailchimpApiKey, mailchimpListId],
    region: 'us-central1',
}, async (event) => {
    await subscribeToMailchimp(event, 'messages');
}); 