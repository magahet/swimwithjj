#!/usr/bin/python2.7

import cgi
import os
import json
import emailer
import stripe
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId


class FormProcessor(object):
    '''Provides methods for handling forms'''

    def __init__(self, params):
        self.params = params
        client = MongoClient(os.getenv('DB_HOST', ''))
        self.db = client[os.getenv('DB_NAME', '')]

    def process(self):
        action = self.params.get('id', '')
        handlers = {
            'signup-notification': self.save_signup_notification,
            'message': self.send_message_to_jj,
            'signup': self.process_signup,
            'save-card': self.save_card,
            'add-card': self.add_card,
            'get-payment-info': self.get_payment_info,
        }
        if action not in handlers:
            return None
        return handlers[action]()

    def save_to_db(self, collection_name, data):
        collection = self.db[collection_name.replace('-', '_')]
        collection.insert(data)
        return True

    def send_message_to_jj(self):
        to_address = os.getenv('MESSAGE_ADDRESS')
        subject = 'Message from: {0}'.format(self.params.get('name', 'Unknown'))
        message = '\n'.join(['{0}:\n{1}\n'.format(key, value) for
                            key, value in
                            self.params.iteritems()])
        from_email = os.getenv('EMAIL_SENDER_ADDRESS')
        password = os.getenv('EMAIL_SENDER_PASSWORD')
        from_name = os.getenv('EMAIL_SENDER_NAME')
        to_address = os.getenv('MESSAGE_ADDRESS')
        email_sent = emailer.send(from_email, password, to_address,
                                  subject, message,
                                  sender_name=from_name)
        return email_sent

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
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        try:
            customer = stripe.Customer.create(card=token, email=email,
                                              description=name)
        except stripe.CardError as error:
            return {'error': str(error)}
        return {'customer_id': customer.id}

    def add_card(self):
        oid = self.params.get('oid', '')
        if not oid:
            return None
        result = self.save_card()
        customer_id = result.get('customer_id', '')
        if not customer_id:
            return result
        return self.db.signup.update({'_id': ObjectId(oid)},
                                     {'$set': {'customer_id': customer_id}})

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

    def get_payment_info(self):
        oid = self.params.get('oid', '')
        result = self.db.signup.find_one({'_id': ObjectId(oid)})
        if result is None:
            return None
        try:
            cost = int(result.get('cost', 0))
        except ValueError:
            return None
        session_count = len([s for
                             c in result.get('children', []) for
                             s in c.get('sessions', [])])
        card_saved = bool(result.get('customer_id', False))
        if cost and session_count:
            return {
                'cost': cost,
                'sessionCount': session_count,
                'cardSaved': card_saved
            }


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
