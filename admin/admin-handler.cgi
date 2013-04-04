#!/usr/bin/python2.7

import cgi
from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
import ConfigParser


class FormProcessor(object):
    '''Provides methods for handling forms'''

    def __init__(self, params, environment_file='../environment',
                 settings_file='/etc/swimwithjj/settings.conf'):
        self.params = params
        self.config = ConfigParser.ConfigParser()
        self.config.read(settings_file)
        with open(environment_file) as file_:
            self.environment = file_.read().strip()
        client = MongoClient()
        self.db = client[self.config.get(self.environment, 'db_name')]
        self.signup = self.db.signup

    def process(self):
        action = self.params.get('action', '')
        handlers = {
            'get_signups': self.get_signups,
            'mark_received': self.mark_received,
            'save_notes': self.save_notes,
        }
        if action not in handlers:
            return None
        return handlers[action]()

    def get_signups(self):
        return [r for r in self.signup.find({})]

    def mark_received(self):
        oid = self.params.get('oid', '')
        if not oid:
            return None
        self.signup.update({'_id': ObjectId(oid)},
                           {'$set': {'payment_received': True}})
        return True

    def save_notes(self):
        oid = self.params.get('oid', '')
        notes = self.params.get('notes', '')
        if not oid or not notes:
            return None
        self.signup.update({'_id': ObjectId(oid)},
                           {'$set': {'notes': notes}})
        return True


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
    print dumps({'params': params, 'response': response}, indent=2)
