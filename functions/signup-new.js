const { logger } = require('firebase-functions/v2');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const utils = require('./utils');

const stripeKey = defineSecret('STRIPE_KEY');
const sibApiKey = defineSecret('SIB_API_KEY');

// Process new signup
exports.signupNew = onDocumentCreated({
  document: 'signups/{uid}',
  secrets: [stripeKey, sibApiKey],
  region: 'us-central1',
}, async (event) => {
  const stripe = require("stripe")(stripeKey.value());
  const snap = event.data;
  const signup = snap.data();

  await sendConfirmationEmail(signup);

  try {
    // Search for existing customer with the same email
    const customerSearchResults = await stripe.customers.search({
      query: `email:'${signup.parent.email}'`,
    });

    let customer;

    if (customerSearchResults.data.length > 0) {
      // Use existing customer
      customer = customerSearchResults.data[0];
      logger.log(`Using existing customer: ${customer.id}`);

      // Attach the new payment method to the existing customer
      await stripe.paymentMethods.attach(
        signup.paymentMethodId,
        { customer: customer.id }
      );

      // Update customer balance if needed
      await stripe.customers.update(customer.id, {
        balance: signup.paymentTotal * 100,
      });
    } else {
      // Create a new stripe customer with payment method
      customer = await stripe.customers.create({
        balance: signup.paymentTotal * 100,
        description: signup.parent.name,
        name: signup.parent.name,
        email: signup.parent.email,
        payment_method: signup.paymentMethodId,
      });
      logger.log(`Created new customer: ${customer.id}`);
    }

    logger.log(customer);
    await snap.ref.update({ stripeCustomerId: customer.id });
  } catch (err) {
    logger.error('Could not save stripe customer id:', signup.parent.name, err);
    await snap.ref.update({ stripeError: err });
  }
  return null;
});


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

  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = sibApiKey.value();

  const msg = {
    'subject': subject,
    'sender': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'replyTo': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'to': [{ 'name': signup.parent.name, 'email': signup.parent.email }],
    'textContent': text,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail(msg)
    .then(data => logger.log(`Signup confirmation email sent to: ${signup.parent.email}. ${data}`))
    .catch(err => logger.error('there was an error while sending the signup confirmation email:', err))
}