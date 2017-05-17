#!/usr/bin/python2.7
'''Admin form handler.'''

import yaml
import json
import sys
from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
from collections import defaultdict


class FormProcessor(object):
    '''Provides methods for handling forms'''

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
        self.valid_fields = set([
            'process_status',
            'payment_received',
            'notes',
            'cost',
        ])

    def process(self):
        handlers = {
            'get_summary': self.get_summary,
            'get_signups': self.get_signups,
            'add_session': self.add_session,
            'remove_session': self.remove_session,
            'save_session': self.save_session,
            'set': self.set_,
            'delete': self.delete,
        }
        if self.request_type not in handlers:
            return {
                'status': 'error',
                'message': 'Request type is invalid'
            }
        return handlers[self.request_type]()

    def get_summary(self):
        signups = self.get_signups().get('data', [])
        sessions = defaultdict(list)
        for signup in signups:
            for child in signup.get('children', []):
                for session in child.get('sessions', []):
                    sessions[session].append(child.get('name'))
        return {
            'status': 'success',
            'data': [
                {
                    'session': k,
                    'count': len(v),
                    'kids': v,
                } for k, v in sessions.iteritems()
            ]
        }

    def get_signups(self):
        return {
            'status': 'success',
            'data': [r for r in self.db.signup.find({'deleted': {'$exists': False}})]
        }

    @staticmethod
    def error(message='Unknown error occurred'):
        return {
            'status': 'error',
            'message': message
        }

    def update(self, query):
        success = self.db.signup.update(query)
        if success:
            return {
                'status': 'success',
                'data': []
            }
        else:
            return {
                'status': 'error',
                'message': 'There was a document update error with the db.'
            }

    @staticmethod
    def parse(value):
        '''Try to cast into bool, int, float.'''
        def filter_(value):
            return value

        try:
            return yaml.load(filter_(value))
        except ValueError:
            return None

    def set_(self):
        oid = self.request.get('oid')
        if not oid:
            return self.error('Invalid oid')
        key = self.request.get('key')
        if key not in self.valid_fields:
            return self.error('Invalid field')
        value = self.parse(self.request.get(key))
        if value is None:
            return self.error('Invalid value')
        return self.update(
            {'_id': ObjectId(oid)},
            {'$set': {key: value}})

    def add_session(self):
        oid = self.request.get('oid', '')
        child_index = self.request.get('childIndex', '')
        session = self.request.get('session', '')
        if not oid or not child_index or not session:
            return None
        return self.update(
            {'_id': ObjectId(oid)},
            {'$push': {'children.{0}.sessions'.format(child_index): session}})

    def remove_session(self):
        oid = self.request.get('oid', '')
        child_index = self.request.get('childIndex', '')
        session = self.request.get('session', '')
        if not oid or not child_index or not session:
            return None
        return self.update(
            {'_id': ObjectId(oid)},
            {'$pull': {'children.{0}.sessions'.format(child_index): session}})

    def save_session(self):
        oid = self.request.get('oid', '')
        child_index = self.request.get('childIndex', '')
        session_index = self.request.get('sessionIndex', '')
        session = self.request.get('session', '')
        if not oid or not child_index or not session:
            return None
        return self.update(
            {'_id': ObjectId(oid)},
            {'$set': {'children.{0}.sessions.{1}'.format(child_index, session_index): session}})

    def delete(self):
        oid = self.request.get('oid', '')
        if not oid:
            return None
        return self.update(
            {'_id': ObjectId(oid)},
            {'$set': {'deleted': True}})


if __name__ == "__main__":
    print 'Content-type: application/json\n'
    processor = FormProcessor()
    response = processor.process()
    print dumps(response, indent=2)
