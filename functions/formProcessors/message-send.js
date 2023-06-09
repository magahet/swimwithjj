const functions = require('firebase-functions');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const utils = require('./utils')




// Sends an email when a user sends a message on the site.
exports.messageSend = functions
  .runWith({ secrets: ["SIB_API_KEY"] })
  .firestore.document('/messages/{uid}').onCreate((snap, context) => {
    const message = snap.data()

    // Building Email message.
    const text = `
${message.email}
${message.phone}

${message.message}
`

    let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SIB_API_KEY;

    const msg = {
        'subject': `Message from ${message.name}`,
        'sender' : {'email':'jj@swimwithjj.com', 'name':'JJ'},
        'replyTo' : {'email':'jj@swimwithjj.com', 'name':'JJ'},
        'to' : [{'name': 'JJ', 'email':'jj@swimwithjj.com'}],
        'textContent' : text,
    }

    new SibApiV3Sdk.TransactionalEmailsApi()
      .sendTransacEmail(msg)
      .then(data => functions.logger.log(`Message email sent. ${data}`))
      .catch(err => functions.logger.error('there was an error while sending the message email:', err))
  }
);