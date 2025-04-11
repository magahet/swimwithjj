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

  // Create HTML version of the email
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Contact Message</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0078B3; font-size: 28px; margin: 0;">Swim With JJ</h1>
    </div>
    
    <div style="background-color: #f7f7f7; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
      <h1 style="color: #0078B3; margin-top: 0; font-size: 24px;">New Message from Website Contact Form</h1>
      
      <div style="background-color: #E8F5FE; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0; font-size: 18px; color: #0078B3;">Contact Information:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
            <td style="padding: 8px 0;">${message.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${message.email}" style="color: #0078B3; text-decoration: none;">${message.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0;"><a href="tel:${message.phone}" style="color: #0078B3; text-decoration: none;">${message.phone}</a></td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 20px;">
        <h2 style="margin-top: 0; font-size: 18px; color: #0078B3;">Message:</h2>
        <div style="background-color: white; border-radius: 5px; padding: 15px; border-left: 4px solid #0078B3;">
          <p style="white-space: pre-line; margin: 0;">${message.message}</p>
        </div>
      </div>
      
      <div style="margin-top: 25px; background-color: #FFFFE0; padding: 15px; border-radius: 5px;">
        <p style="margin: 0;"><strong>Quick Response Options:</strong></p>
        <p style="margin: 10px 0 0 0;">
          <a href="mailto:${message.email}" style="display: inline-block; background-color: #0078B3; color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px; margin-right: 10px;">Reply by Email</a>
          <a href="tel:${message.phone}" style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px;">Call Back</a>
        </p>
      </div>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #777; text-align: center;">
      <p>This message was sent from the contact form at <a href="https://www.swimwithjj.com" style="color: #0078B3; text-decoration: none;">swimwithjj.com</a></p>
      <p>&copy; ${new Date().getFullYear()} SwimWithJJ. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;

  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = sibApiKey.value();

  const msg = {
    'subject': `Message from ${message.name}`,
    'sender': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'replyTo': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'to': [{ 'name': process.env.EMAIL_TO_NAME, 'email': process.env.EMAIL_TO }],
    'textContent': text,
    'htmlContent': html,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail(msg)
    .then(data => logger.log(`Message email sent. ${data}`))
    .catch(err => logger.error('there was an error while sending the message email:', err))
});