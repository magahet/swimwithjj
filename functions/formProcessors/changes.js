const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail')


const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0
})

exports.processSignupChanges = functions
  .runWith({ secrets: ["SENDGRID_API_KEY"] })
  .firestore
  .document('/signups/{uid}')
  .onUpdate((change, context) => {
    const oldSignup = change.before.data()
    const newSignup = change.after.data()

    if (newSignup.status !== oldSignup.status && newSignup.status === 'lessons scheduled') {
      return sendLessonTimeEmail(newSignup)
    }

    functions.logger.debug('signup changed, but status did not trigger ')
    return null
  })


function sendLessonTimeEmail(signup) {

  const cost = currencyFormatter.format(signup.paymentTotal)

  const lessons = signup.children.map(child => {
    return `${child.name}:\n` + child.sessions.map(s => `${s.text} at ${s.time}`).join('\n')
  }).join('\n\n')

  const body = `Your lesson times have been set!
You have been scheduled for the following sessions and times:

${lessons}

Payment will be charged to the credit card you provided.
The total amount that will be charged is: ${cost}   
`

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: signup.parent.email, // Change to your recipient
    from: '"JJ" <jj@swimwithjj.com>',
    subject: 'SwimWithJJ Lesson Times',
    text: body
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      return
    })
    .catch((error) => {
      console.error(error)
    })

}