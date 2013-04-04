#!/usr/bin/python2.7

import cgi
import json
import emailer
import stripe
import ConfigParser
from datetime import datetime
from pymongo import MongoClient


class FormProcessor(object):
    '''Provides methods for handling forms'''

    def __init__(self, params, environment_file='environment',
                 settings_file='/etc/swimwithjj/settings.conf'):
        self.params = params
        self.config = ConfigParser.ConfigParser()
        self.config.read(settings_file)
        with open(environment_file) as file_:
            self.environment = file_.read().strip()
        client = MongoClient()
        self.db = client[self.config.get(self.environment, 'db_name')]

    def process(self):
        action = self.params.get('id', '')
        handlers = {
            'signup-notification': self.save_signup_notification,
            'message': self.send_message_to_jj,
            'signup': self.process_signup,
            'save-card': self.save_card,
        }
        if action not in handlers:
            return None
        return handlers[action]()

    def save_to_db(self, collection_name, data):
        collection = self.db[collection_name.replace('-', '_')]
        collection.insert(data)
        return True

    def send_message_to_jj(self):
        to_address = self.config.get(self.environment, 'message_address')
        subject = 'Message from: {0}'.format(self.params.get('name', 'Unknown'))
        message = '\n'.join(['{0}:\n{1}\n'.format(key, value) for
                            key, value in
                            self.params.iteritems()])
        from_email = self.config.get(self.environment, 'email_sender_address')
        password = self.config.get(self.environment, 'email_sender_password')
        from_name = self.config.get(self.environment, 'email_sender_name')
        to_address = self.config.get(self.environment, 'message_address')
        email_sent = emailer.send(from_email, password, to_address,
                                  subject, message,
                                  sender_name=from_name)

    def save_signup_notification(self):
        email = self.params.get('email', '')
        if not email:
            return None
        data = {
            'email': email,
            'timestamp': datetime.utcnow()
        }
        return self.save_to_db(self.params.get('id', ''), data)

    def save_card(self):
        token = self.params.get('stripe-token', '')
        if not token:
            return {'error': 'invalid token'}
        email = self.params.get('email')
        name = self.params.get('name')
        stripe.api_key = self.config.get(self.environment, 'stripe_secret_key')
        try:
            customer = stripe.Customer.create(card=token, email=email,
                                              description=name)
        except stripe.CardError as error:
            return {'error': str(error)}
        return {'customer_id': customer.id}

    def process_signup(self):
        try:
            child_count = int(self.params.get('child_count', 0))
        except ValueError:
            return None
        children_list = []
        for index in range(child_count):
            child_data = {}
            field_list = ['child_name', 'birthday', 'swim_level']
            for field in field_list:
                child_data[field] = self.params.get('{0}-{1}'.format(field, index))
            child_data['sessions'] = [v for
                                      k, v in
                                      self.params.items() if
                                      'sessions-{0}'.format(index) in k]
            if child_data['sessions']:
                children_list.append(child_data)
        signup_form = {
            'timestamp': datetime.utcnow(),
            'location': self.params.get('location-select'),
            'name': self.params.get('name'),
            'phone': self.params.get('phone'),
            'email': self.params.get('email'),
            'request': self.params.get('request'),
            'customer_id': self.params.get('customer_id'),
            'cost': self.params.get('cost'),
            'payment_received': False,
            'children': children_list
        }
        return self.save_to_db(self.params.get('id'), signup_form)


def get_cgi_dict():
    """Get a plain dictionary, rather than the '.value' system used by the cgi module."""
    fieldStorage = cgi.FieldStorage()
    params = {}
    for key in fieldStorage.keys():
        params[key] = fieldStorage.getfirst(key)
    return params


if __name__ == "__main__":
    print 'Content-type: application/json\n'
    params = get_cgi_dict()
    processor = FormProcessor(params)
    response = processor.process()
    print json.dumps({'params': params, 'response': response}, indent=2)
