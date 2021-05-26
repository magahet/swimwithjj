import logging

import stripe
import firestore

import formatters
import emailer

logger = logging.getLogger(__name__)


def process_new_signup(data, context):
    doc = firestore.get_doc(context)
    signup = data.get('value')
    email.send_confirmation_email(signup)
    try:
        customer_id = stripe.create_stripe_customer({
          "account_balance": signup.get('paymentTotal') * 100,
          "description": signup.get('parent').get('name'),
          "name": signup.get('parent').get('name'),
          "email": signup.get('parent').get('email'),
          "source": signup.get('token'),
        })
    except Exception as err:
        id = context.get('resource')
        print(f'Could not save stripe customer id: {id}, {err}')
        firestore.update(context, {'stripeError': err})


def process_signup_changes(data, context):
  old_doc = data.get('oldValue')
  new_doc = data.get('value')

  if new_doc.get('status') != old_doc.get('status') and new_doc.get('status') == 'lessons scheduled':
    return send_lesson_time_email(new_doc)

  print('signup changed, but status did not trigger ')
  return None


# function sendConfirmationEmail(signup) {
#   // Send confirmation email
#   const mailOptions = {
#     from: '"JJ" <jj@swimwithjj.com>',
#     to: signup.parent.email,
#   }

#   const cost = currencyFormatter.format(signup.paymentTotal)

#   // Building Email message.
#   mailOptions.subject = 'SwimWithJJ Signup Confirmation'
#   mailOptions.text = `Thank You!

# You have completed the signup process at www.swimwithjj.com
# JJ will contact you with your exact lesson times within the next two weeks.

# Your credit card will only be charged after you have received your lesson times.
# The total amount that will be charged is: ${cost}

# You have signed up for the following sessions:

# `

#   signup.children.forEach(child => {
#     mailOptions.text += `${child.name}:\n`
#     mailOptions.text += child.sessions.map(s => s.text).join("\n")
#     mailOptions.text += "\n\n"
#   })
    
#   return mailTransport.sendMail(mailOptions)
#     .then(() => console.log('Signup confirmation email sent to:', signup.parent.email))
#     .catch(err => console.error('There was an error while sending the signup confirmation email:', err))
# }
def send_confirmation_email(signup):
  # Send confirmation email
  mail_options = {
    "from": '"JJ" <jj@swimwithjj.com>',
    "to": signup.get('parent').get('email'),
  }

  cost = currency_formatter(signup.get('paymentTotal'))

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
    .then(() => console.log('Signup confirmation email sent to:', signup.parent.email))
    .catch(err => console.error('There was an error while sending the signup confirmation email:', err))
}



function sendLessonTimeEmail(signup) {
  const mailOptions = {
    from: '"JJ" <jj@swimwithjj.com>',
    to: signup.parent.email,
  }

  const cost = currencyFormatter.format(signup.paymentTotal)

  // Building Email message.
  mailOptions.subject = 'SwimWithJJ Lesson Times'

  const lessons = signup.children.map(child => {
    return `${child.name}:\n` + child.sessions.map(s => `${s.text} at ${s.time}`).join('\n')
  }).join('\n\n')

  mailOptions.text = `Your lesson times have been set!
You have been scheduled for the following sessions and times:

${lessons}

Payment will be charged to the credit card you provided.
The total amount that will be charged is: ${cost}   
`
    
return mailTransport.sendMail(mailOptions)
  .then(() => console.log('Signup confirmation email sent to:', signup.parent.email))
  .catch(err => console.error('There was an error while sending the signup confirmation email:', err))

}
