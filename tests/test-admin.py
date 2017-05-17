#!/usr/bin/env python

import requests
import nose.tools as nt


class TestAdmin(object):
    def __init__(self):
        self.url = 'https://www.swimwithjj.com/admin/admin-handler.cgi'
        self.auth = (os.getenv('user'), os.getenv('pass'))

    def test_get_summary(self):
        response = requests.get(self.url, json={'id': 'get_summary'}, auth=self.auth)
        print response.json()
        nt.eq_(response.json().get('status'), 'success')
        for summary in response.json().get('data', []):
            nt.eq_(set(summary.keys()), set(['count', 'session', 'kids']))
            break  # Only check one

    def test_get_sessions(self):
        response = requests.get(self.url, json={'id': 'get_signups'}, auth=self.auth)
        print response.json()
        nt.eq_(response.json().get('status'), 'success')
        for signup in response.json().get('data', []):
            nt.eq_(set(signup.keys()),
                   set([
                       'customer_id',
                       'name',
                       'sessions',
                       'timestamp',
                       'request',
                       'phone',
                       'token',
                       'cost',
                       'payment_received',
                       'process_status',
                       '_id',
                       'id']))
            break  # Only check one
