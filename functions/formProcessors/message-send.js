const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail')
const utils = require('./utils')




// Sends an email when a user sends a message on the site.
exports.messageSend = functions
  .runWith({ secrets: ["SENDGRID_API_KEY"] })
  .firestore.document('/messages/{uid}').onCreate((snap, context) => {
    const message = snap.data()

    // Building Email message.
    text = `
${message.email}
${message.phone}

${message.message}
`

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: '"JJ" <jj@swimwithjj.com>',
      from: '"JJ" <jj@swimwithjj.com>',
      subject: `Message from ${message.name}`,
      text: text
    }

    sgMail
      .send(msg)
      .then(() => functions.logger.log('Message email sent'))
      .catch(err => functions.logger.error('there was an error while sending the message email:', err))
  })