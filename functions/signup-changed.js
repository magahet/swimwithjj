const { logger } = require('firebase-functions/v2');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const utils = require('./utils');

const sibApiKey = defineSecret('SIB_API_KEY');

exports.signupChanged = onDocumentUpdated({
  document: 'signups/{uid}',
  secrets: [sibApiKey],
  region: 'us-central1',
}, (event) => {
  const oldSignup = event.data.before.data();
  const newSignup = event.data.after.data();

  if (newSignup.status !== oldSignup.status && newSignup.status === 'lessons scheduled') {
    return sendLessonTimeEmail(newSignup);
  }

  logger.debug('signup changed, but status did not trigger ');
  return null;
});


function sendLessonTimeEmail(signup) {

  const cost = utils.currencyFormatter.format(signup.paymentTotal);

  const lessons = signup.children.map(child => {
    return `${child.name}:\n` + child.sessions.map(s => `${s.text} at ${s.time}`).join('\n');
  }).join('\n\n');

  const body = `Your lesson times have been set!
You have been scheduled for the following sessions and times:

${lessons}

Payment will be charged to the credit card you provided.
The total amount that will be charged is: ${cost}   
`;

  // Create HTML version of the email
  let lessonsHtml = '';
  signup.children.forEach(child => {
    lessonsHtml += `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #0078B3; margin-top: 0; margin-bottom: 10px; font-size: 18px;">${child.name}</h3>
      <ul style="padding-left: 20px; margin-top: 5px;">
      ${child.sessions.map(s => `
        <li style="margin-bottom: 8px;">
          <strong>${s.text}</strong> at ${s.time}
        </li>`).join('')}
      </ul>
    </div>`;
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SwimWithJJ Lesson Times</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0078B3; font-size: 28px; margin: 0;">Swim With JJ</h1>
    </div>
    
    <div style="background-color: #f7f7f7; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
      <h1 style="color: #0078B3; margin-top: 0; font-size: 24px;">Your Lesson Times Are Set!</h1>
      
      <p>Hello ${signup.parent.name},</p>
      
      <p>Great news! Your swimming lessons with JJ have been scheduled. Below you'll find the details of your upcoming sessions.</p>
      
      <div style="background-color: #E8F5FE; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Payment Information:</strong></p>
        <p style="margin: 5px 0 0 0;">Your credit card will now be charged the amount of <strong>${cost}</strong>.</p>
        <p style="margin: 5px 0 0 0;">This charge will appear on your statement as "SwimWithJJ".</p>
      </div>
    </div>
    
    <div style="background-color: #f7f7f7; border-radius: 8px; padding: 25px;">
      <h2 style="color: #0078B3; margin-top: 0; font-size: 20px;">Your Swimming Lessons Schedule</h2>
      
      ${lessonsHtml}
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #777; text-align: center;">
      <p>If you have any questions, please reply to this email or use the contact form on our website.</p>
      <p>We look forward to seeing you in the pool!</p>
      <p>
        <a href="https://www.swimwithjj.com" style="color: #0078B3; text-decoration: none;">www.swimwithjj.com</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} SwimWithJJ. All rights reserved.</p>
    </div>
  </body>
  </html>
  `;

  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = sibApiKey.value();

  const msg = {
    'subject': 'SwimWithJJ Lesson Times',
    'sender': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'replyTo': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'to': [{ 'name': signup.parent.name, 'email': signup.parent.email }],
    'textContent': body,
    'htmlContent': html,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail(msg)
    .then(data => logger.log(`Lesson Time email sent to: ${signup.parent.email}. ${data}`))
    .catch(err => logger.error('there was an error while sending the message email:', err));

}