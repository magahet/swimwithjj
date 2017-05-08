#!/usr/bin/python2.7
'''Admin form handler.'''

import cgi
from pymongo import MongoClient
from bson.json_util import dumps
from bson.objectid import ObjectId
from collections import defaultdict
import yaml


class FormProcessor(object):
    '''Provides methods for handling forms'''

    def __init__(self, params, settings_file='/etc/swimwithjj/settings.yaml'):
        self.params = params
        with open(settings_file, 'r') as file_:
            self.config = yaml.load(file_)
        client = MongoClient()
        self.db = client[self.config.get('db_name', 'swimwithjj')]
        self.signup = self.db.signup

    def process(self):
        action = self.params.get('action', '')
        handlers = {
            'get_summary': self.get_summary,
            'get_signups': self.get_signups,
            'set_received': self.set_received,
            'save_notes': self.save_notes,
            'add_session': self.add_session,
            'remove_session': self.remove_session,
            'set_cost': self.set_cost,
            'set_status': self.set_status,
            'save_session': self.save_session,
            'delete': self.delete,
        }
        if action not in handlers:
            return None
        return handlers[action]()

    def get_summary(self):
        signups = self.get_signups()
        sessions = defaultdict(list)
        for signup in signups:
            for child in signup.get('children', []):
                for session in child.get('sessions', []):
                    sessions[session].append(child.get('child_name'))
        return [
            {
                'session': k,
                'count': len(v),
                'kids': v,
            } for k, v in sessions.iteritems()
        ]

    def get_signups(self):
        return [r for r in self.signup.find({'deleted': {'$exists': False}})]

    def set_status(self):
        oid = self.params.get('oid', '')
        status = self.params.get('process_status', '')
        if not oid or not status:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$set': {'process_status': status}})

    def set_cost(self):
        oid = self.params.get('oid', '')
        try:
            cost = int(self.params.get('cost'))
        except ValueError:
            return None
        if not oid:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$set': {'cost': cost}})

    def set_received(self):
        oid = self.params.get('oid', '')
        state = self.params.get('payment_received')
        if not oid or state is None:
            return None
        state = True if state == 'true' else False
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$set': {'payment_received': state}})

    def save_notes(self):
        oid = self.params.get('oid', '')
        notes = self.params.get('notes', '')
        if not oid or not notes:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$set': {'notes': notes}})

    def add_session(self):
        oid = self.params.get('oid', '')
        child_index = self.params.get('childIndex', '')
        session = self.params.get('session', '')
        if not oid or not child_index or not session:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$push': {'children.{0}.sessions'.format(child_index): session}})

    def remove_session(self):
        oid = self.params.get('oid', '')
        child_index = self.params.get('childIndex', '')
        session = self.params.get('session', '')
        if not oid or not child_index or not session:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$pull': {'children.{0}.sessions'.format(child_index): session}})

    def save_session(self):
        oid = self.params.get('oid', '')
        child_index = self.params.get('childIndex', '')
        session_index = self.params.get('sessionIndex', '')
        session = self.params.get('session', '')
        if not oid or not child_index or not session:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$set': {'children.{0}.sessions.{1}'.format(child_index, session_index): session}})

    def delete(self):
        oid = self.params.get('oid', '')
        if not oid:
            return None
        return self.signup.update({'_id': ObjectId(oid)},
                                  {'$set': {'deleted': True}})


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
