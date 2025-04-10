const { logger } = require('firebase-functions/v2');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const utils = require('./utils');

const sibApiKey = defineSecret('SIB_API_KEY');

// Sends an email when a user sends a message on the site.
exports.messageSend = onDocumentCreated({
  document: 'messages/{uid}',
  secrets: [sibApiKey],
  region: 'us-central1',
}, (event) => {
  const message = event.data.data();

  // Building Email message.
  const text = `
${message.email}
${message.phone}

${message.message}
`

  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = sibApiKey.value();

  const msg = {
    'subject': `Message from ${message.name}`,
    'sender': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'replyTo': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'to': [{ 'name': process.env.EMAIL_TO_NAME, 'email': process.env.EMAIL_TO }],
    'textContent': text,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail(msg)
    .then(data => logger.log(`Message email sent. ${data}`))
    .catch(err => logger.error('there was an error while sending the message email:', err))
});