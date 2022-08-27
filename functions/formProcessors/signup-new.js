const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail')
const utils = require('./utils')


// Process new signup
exports.signupNew = functions
  .runWith({ secrets: ["STRIPE_KEY", "SENDGRID_API_KEY"] })
  .firestore.document('/signups/{uid}').onCreate(async (snap, context) => {

    const stripe = require("stripe")(process.env.STRIPE_KEY)
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


function sendConfirmationEmail(signup) {
  // Send confirmation email
  const mailOptions = {
    from: '"JJ" <jj@swimwithjj.com>',
    to: signup.parent.email,
  }

  const cost = utils.currencyFormatter.format(signup.paymentTotal)

  // Building Email message.
  const subject = 'SwimWithJJ Signup Confirmation'
  let text = `Thank You!

You have completed the signup process at www.swimwithjj.com
JJ will contact you with your exact lesson times within the next two weeks.

Your credit card will only be charged after you have received your lesson times.
The total amount that will be charged is: ${cost}

You have signed up for the following sessions:

`

  signup.children.forEach(child => {
    text += `${child.name}:\n`
    text += child.sessions.map(s => s.text).join("\n")
    text += "\n\n"
  })

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: signup.parent.email, // Change to your recipient
    from: '"JJ" <jj@swimwithjj.com>',
    subject: 'SwimWithJJ Lesson Times',
    text: text
  }

  sgMail
    .send(msg)
    .then(() => functions.logger.log('Signup confirmation email sent to:', signup.parent.email))
    .catch(err => functions.logger.error('there was an error while sending the signup confirmation email:', err))
}