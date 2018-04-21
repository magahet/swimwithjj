#!/usr/bin/env python

import sys
import json
import emailer
import stripe
import yaml
from datetime import datetime
from pymongo import MongoClient


class FormProcessor(object):
    '''Provides methods for handling forms.
    Response uses jsend standard schema'''

    def __init__(self, settings_file='/etc/swimwithjj/settings.yaml'):
        try:
            self.request = json.load(sys.stdin)
        except ValueError:
            self.request = {}
        self.request_type = self.request.get('id')
        with open(settings_file, 'r') as file_:
            self.config = yaml.load(file_)
        client = MongoClient()
        self.db = client[self.config.get('db_name', 'swimwithjj')]

    def process(self):
        handlers = {
            'waitlist': self.save_waitlist,
            'contact': self.send_message_to_jj,
            'signup': self.process_signup,
        }
        if self.request_type not in handlers:
            return {
                'status': 'error',
                'message': 'Request type is invalid'
            }
        return handlers[self.request_type]()

    def save_to_db(self, collection_name, data):
        collection = self.db[collection_name.replace('-', '_')]
        try:
            collection.insert(data)
            return {
                'status': 'success',
                'data': None
            }
        except Exception as error:
            return {
                'status': 'error',
                'message': str(error)
            }

    def send_message_to_jj(self):
        to_address = self.config.get('admin_address')
        subject = 'Message from: {0}'.format(self.request.get('name', 'Unknown'))
        message = '\n'.join(['{0}:\n{1}\n'.format(key, value) for
                            key, value in
                            self.request.iteritems()])
        from_email = self.config.get('email_sender_address')
        password = self.config.get('email_sender_password')
        from_name = self.config.get('email_sender_name')
        to_address = self.config.get('admin_address')
        email_sent = emailer.send(from_email, password, to_address,
                                  subject, message,
                                  sender_name=from_name)
        if email_sent:
            return {
                'status': 'success',
                'data': None
            }
        else:
            return {
                'status': 'error',
                'message': 'Could not send email'
            }

    def save_waitlist(self):
        email = self.request.get('email', '')
        if not email:
            return {'error': 'No address specified'}
        data = {
            'email': email,
            'timestamp': datetime.utcnow()
        }
        return self.save_to_db(self.request_type, data)

    def process_signup(self):
        token = self.request.get('token', '')
        email = self.request.get('email', '')
        name = self.request.get('name', '')
        stripe.api_key = self.config.get('stripe_secret_key')
        try:
            customer = stripe.Customer.create(card=token, email=email,
                                              description=name)
        except Exception as error:
            return {
                'status': 'error',
                'message': str(error)
            }
        signup_form = self.request.copy()
        signup_form.update({
            'timestamp': datetime.utcnow(),
            'customer_id': customer.id,
            'payment_received': False,
        })
        return self.save_to_db(self.request_type, signup_form)


if __name__ == "__main__":
    print 'Content-type: application/json\n'
    processor = FormProcessor()
    response = processor.process()
    print json.dumps(response, indent=2)
