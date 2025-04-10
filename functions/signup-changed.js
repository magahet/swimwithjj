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
  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = sibApiKey.value();

  const msg = {
    'subject': 'SwimWithJJ Lesson Times',
    'sender': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'replyTo': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'to': [{ 'name': signup.parent.name, 'email': signup.parent.email }],
    'textContent': body,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail(msg)
    .then(data => logger.log(`Lesson Time email sent to: ${signup.parent.email}. ${data}`))
    .catch(err => logger.error('there was an error while sending the message email:', err));

}