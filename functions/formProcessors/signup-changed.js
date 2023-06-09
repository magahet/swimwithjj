const functions = require('firebase-functions');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const utils = require('./utils')


exports.signupChanged = functions
  .runWith({ secrets: ["SIB_API_KEY"] })
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

  const cost = utils.currencyFormatter.format(signup.paymentTotal)

  const lessons = signup.children.map(child => {
    return `${child.name}:\n` + child.sessions.map(s => `${s.text} at ${s.time}`).join('\n')
  }).join('\n\n')

  const body = `Your lesson times have been set!
You have been scheduled for the following sessions and times:

${lessons}

Payment will be charged to the credit card you provided.
The total amount that will be charged is: ${cost}   
`
  let client = SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SIB_API_KEY;

  const msg = {
    'subject': `SwimWithJJ Lesson Times`,
    'sender' : {'email':'jj@swimwithjj.com', 'name':'JJ'},
    'replyTo' : {'email':'jj@swimwithjj.com', 'name':'JJ'},
    'to' : [{'name': signup.parent.name, 'email':signup.parent.email}],
    'textContent' : body,
  }

  new SibApiV3Sdk.TransactionalEmailsApi()
      .sendTransacEmail(msg)
      .then(data => functions.logger.log(`Lesson Time email sent to: ${signup.parent.email}. ${data}`))
      .catch(err => functions.logger.error('there was an error while sending the message email:', err))

}