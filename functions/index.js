const admin = require('firebase-admin');
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0
})

admin.initializeApp();

// Sends an email confirmation when a user changes his mailing list subscription.
exports.sendEmailConfirmation = functions.firestore.document('/signups/{uid}').onCreate((snap, context) => {
  const signup = snap.data();

  const mailOptions = {
    from: '"JJ" <jj@swimwithjj.com>',
    to: signup.parent.email,
  };

  const cost = currencyFormatter.format(signup.parent.paymentTotal)

  // Building Email message.
  mailOptions.subject = 'SwimWithJJ Signup Confirmation';
  mailOptions.text = `Thank You!

You have completed the signup process at www.swimwithjj.com
JJ will contact you with your exact lesson times within the next two weeks.

Your credit card will only be charged after you have received your lesson times.
The total amount that will be charged is: ${cost}

You have signed up for the following sessions:
`

  signup.children.forEach(child => {
    mailOptions.text += `${child.name}: ${child.sessions} `
  })
    
  return mailTransport.sendMail(mailOptions)
    .then(() => console.log('Signup confirmation email sent to:', signup.parent.email))
    .catch(err => console.error('There was an error while sending the signup confirmation email:', err))
});