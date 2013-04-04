#!/usr/bin/python2.7

import os
import atexit
from time import sleep
import locale
from cuisine import text_strip_margin
from pymongo import MongoClient
import pystache
import logging
import argparse
import emailer
import ConfigParser


class EmailService(object):
    '''A daemon service for sending emails'''
    def __init__(self, settings_file='/etc/swimwithjj/settings.conf',
                 pidfile='/tmp/email-service.pid', interval=600,
                 collection_name='signup',
                 test_mode=False, environment='master'):
        self.pidfile = pidfile
        self.interval = interval
        self.test_mode = test_mode
        self.pid_setup()
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        self.config = ConfigParser.ConfigParser()
        self.environment = environment
        self.config.read(settings_file)
        client = MongoClient()
        db = client[self.config.get(environment, 'db_name')]
        self.collection = db[collection_name]
        self.logger = logging.getLogger('EmailService')
        self.logger.setLevel(logging.INFO)

    def pid_setup(self):
        pid = str(os.getpid())
        if os.path.isfile(self.pidfile):
            raise Exception('pidfile already exists: '
                            '[{0}]'.format(self.pidfile))
        file(self.pidfile, 'w').write(pid)
        atexit.register(self.del_pid_file)

    def del_pid_file(self):
        os.remove(self.pidfile)

    def run(self):
        try:
            while True:
                self.process()
                sleep(self.interval)
        except KeyboardInterrupt:
            self.logger.warn('Received interrupt. Stopping Email Service')
            return

    def process(self):
        self.logger.debug('Starting new process loop')
        handlers = {
            '': self.send_signup_confirmation,
        }
        for record in self.get_records():
            self.logger.debug('Processing record: [%s]', str(record))
            status = record.get('process_status', '')
            if status not in handlers:
                continue
            handlers[status](record)

    def get_records(self):
        results = self.collection.find({})
        for record in results:
            yield record

    def set_status(self, status, record):
        self.logger.info('Updating status: [%s] for record: [%s]',
                         status, record.get('_id', ''))
        self.collection.update({'_id': record.get('_id', '')},
                               {'$set': {'process_status': status}})

    def send_signup_confirmation(self, record):
        if not record.get('email', ''):
            self.set_status('error: email not provided', record)
            return
        try:
            cost = int(record.get('cost', 0))
        except ValueError:
            self.set_status('error: cost not valid', record)
            return
        if not cost:
            self.set_status('error: cost is zero', record)
            return
        cost_str = locale.currency(float(cost) / 100.0)
        if record.get('customer_id', ''):
            record['payment_message'] = text_strip_margin('''
                |Your credit card will only be charged after you receive your lesson times.
                |The total amount that will be charded is: {0}
            ''').format(cost_str)
        else:
            record['payment_message'] = text_strip_margin('''
                |Your payment by check or cash will be due within 5 days after receiving your lesson times.
                |The total amount due is: {0}
            ''').format(cost_str)
        template = text_strip_margin('''
            |Thank You!
            |
            |This purpose of this email is to confirm that you have completed the signup process at www.swimwithjj.com
            |JJ will contact you with your exact lesson times within the next 3 weeks.
            |
            |{{payment_message}}
            |
            |You have signed up for the following sessions:
            |
            |{{#children}}
            |Lessons for {{child_name}}:
            |{{#sessions}}
            |{{.}}
            |{{/sessions}}
            |
            |{{/children}}
            |
            |Please do not reply to this email address. It is used only to send automated emails.
            |To contact JJ, please use the Contact form at http://www.swimwithjj.com
            ''')
        message = pystache.render(template, record)
        if self.test_mode:
            print '-' * 80
            print message
            print '-' * 80
            return
        from_email = self.config.get(self.environment, 'email_sender_address')
        password = self.config.get(self.environment, 'email_sender_password')
        from_name = self.config.get(self.environment, 'email_sender_name')
        email_sent = emailer.send(from_email, password, record.get('email', ''),
                                  'SwimWithJJ Signup Confirmation', message,
                                  sender_name=from_name)
        if email_sent:
            self.set_status('signup confirmation sent', record)
        else:
            self.set_status('error: failed to send signup confirmation email', record)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--test', help='run in test mode',
                        default=False, action='store_true')
    parser.add_argument('-e', '--env', help='environment to poll',
                        default='master')
    parser.add_argument('-s', '--settings', help='settings file',
                        default='/etc/swimwithjj/settings.conf')
    parser.add_argument('-p', '--pid', help='pid file',
                        default='/tmp/email-service.pid')
    parser.add_argument('-i', '--interval', help='interval (sec)',
                        default=600, type=int)
    args = parser.parse_args()
    print 'Starting Email Service'
    logging.basicConfig()
    email_service = EmailService(settings_file=args.settings, pidfile=args.pid,
                                 interval=args.interval, test_mode=args.test,
                                 environment=args.env)
    email_service.run()
