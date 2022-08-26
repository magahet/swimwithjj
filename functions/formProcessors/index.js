const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const stripe = require("stripe")(functions.config().stripe.key)


const gmailEmail = functions.config().gmail.email
const gmailPassword = functions.config().gmail.password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
})

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0
})

admin.initializeApp()

// New version of processSignupChanges using sendgrid
const changes = require('./changes')
exports.processSignupChanges = changes.processSignupChanges


// Process new signup
exports.processNewSignup = functions.firestore.document('/signups/{uid}').onCreate(async (snap, context) => {
  const signup = snap.data()

  await sendConfirmationEmail(signup)

  // Create a stripe customer with token
  try {
    const customer = await stripe.customers.create({
      account_balance: signup.paymentTotal * 100,
      description: signup.parent.name,
      name: signup.parent.name,
      email: signup.parent.email,
      source: signup.token,
    })
    functions.logger.log(customer)
    await snap.ref.update({ stripeCustomerId: customer.id })
  } catch (err) {
    functions.logger.error('Could not save stripe customer id:', signup.parent.name, err)
    await snap.ref.update({ stripeError: err })
  }
  return null
})



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
    .then(() => functions.logger.log('Message email sent'))
    .catch(err => functions.logger.error('There was an error while sending the message email:', err))
})



function sendConfirmationEmail(signup) {
  // Send confirmation email
  const mailOptions = {
    from: '"JJ" <jj@swimwithjj.com>',
    to: signup.parent.email,
  }

  const cost = currencyFormatter.format(signup.paymentTotal)

  // Building Email message.
  mailOptions.subject = 'SwimWithJJ Signup Confirmation'
  mailOptions.text = `Thank You!

You have completed the signup process at www.swimwithjj.com
JJ will contact you with your exact lesson times within the next two weeks.

Your credit card will only be charged after you have received your lesson times.
The total amount that will be charged is: ${cost}

You have signed up for the following sessions:

`

  signup.children.forEach(child => {
    mailOptions.text += `${child.name}:\n`
    mailOptions.text += child.sessions.map(s => s.text).join("\n")
    mailOptions.text += "\n\n"
  })

  return mailTransport.sendMail(mailOptions)
    .then(() => functions.logger.log('Signup confirmation email sent to:', signup.parent.email))
    .catch(err => functions.logger.error('there was an error while sending the signup confirmation email:', err))
}
