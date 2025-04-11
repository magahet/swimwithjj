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

  let sessionsList = '';
  signup.children.forEach(child => {
    text += `${child.name}:\n`
    text += child.sessions.map(s => s.text).join("\n")
    text += "\n\n"

    // HTML version
    sessionsList += `<div style="margin-bottom: 15px;">
      <strong>${child.name}:</strong>
      <ul style="margin-top: 5px;">
        ${child.sessions.map(s => `<li>${s.text}</li>`).join('')}
      </ul>
    </div>`;
  })

  // Create HTML version of the email
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SwimWithJJ Signup Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0078B3; font-size: 28px; margin: 0;">Swim With JJ</h1>
    </div>
    
    <div style="background-color: #f7f7f7; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
      <h1 style="color: #0078B3; margin-top: 0; font-size: 24px;">Thank You for Signing Up!</h1>
      
      <p>Hello ${signup.parent.name},</p>
      
      <p>You have successfully completed the signup process at <a href="https://www.swimwithjj.com" style="color: #0078B3; text-decoration: none; font-weight: bold;">swimwithjj.com</a>.</p>
      
      <p><strong>What happens next?</strong> JJ will contact you with your exact lesson times within the next two weeks.</p>
      
      <div style="background-color: #E8F5FE; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Payment Information:</strong></p>
        <p style="margin: 5px 0 0 0;">Your credit card will only be charged after you have received your lesson times.</p>
        <p style="margin: 5px 0 0 0;">The total amount that will be charged is: <strong>${cost}</strong></p>
      </div>
    </div>
    
    <div style="background-color: #f7f7f7; border-radius: 8px; padding: 25px;">
      <h2 style="color: #0078B3; margin-top: 0; font-size: 20px;">Your Swimming Sessions</h2>
      
      ${sessionsList}
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #777; text-align: center;">
      <p>If you have any questions, please reply to this email or use the contact form on our website.</p>
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
    'subject': subject,
    'sender': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'replyTo': { 'email': process.env.EMAIL_FROM, 'name': process.env.EMAIL_FROM_NAME },
    'to': [{ 'name': signup.parent.name, 'email': signup.parent.email }],
    'textContent': text,
    'htmlContent': html,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail(msg)
    .then(data => logger.log(`Signup confirmation email sent to: ${signup.parent.email}. ${data}`))
    .catch(err => logger.error('there was an error while sending the signup confirmation email:', err))
}