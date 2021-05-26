// Sends an email when a user sends a message on the site.
exports.sendMessage = functions.firestore.document('/messages/{uid}').onCreate((snap, context) => {
  const message = snap.data()

  const mailOptions = {
    from: '"JJ" <jj@swimwithjj.com>',
    to: '"JJ" <jj@swimwithjj.com>',
  }

  // Building Email message.
  mailOptions.subject = `Message from ${message.name}`
  mailOptions.text = `
${message.email}
${message.phone}

${message.message}
`
    
  return mailTransport.sendMail(mailOptions)
    .then(() => console.log('Message email sent'))
    .catch(err => console.error('There was an error while sending the message email:', err))
})