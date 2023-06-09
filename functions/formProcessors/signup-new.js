const functions = require('firebase-functions');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const utils = require('./utils')


// Process new signup
exports.signupNew = functions
  .runWith({ secrets: ["STRIPE_KEY", "SIB_API_KEY"] })
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

  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SIB_API_KEY;

  const msg = {
    'subject': `SwimWithJJ Lesson Times`,
    'sender' : {'email':'jj@swimwithjj.com', 'name':'JJ'},
    'replyTo' : {'email':'jj@swimwithjj.com', 'name':'JJ'},
    'to' : [{'name': signup.parent.name, 'email':signup.parent.email}],
    'textContent' : text,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
      .sendTransacEmail(msg)
      .then(data => functions.logger.log(`Signup confirmation email sent to: ${signup.parent.email}. ${data}`))
      .catch(err => functions.logger.error('there was an error while sending the signup confirmation email:', err))
}