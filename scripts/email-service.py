#!/usr/bin/python2.7

import os
import sys
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
from datetime import date, timedelta
import signal


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
        atexit.register(self.exit)
        signal.signal(signal.SIGTERM, self.exit)
        signal.signal(signal.SIGHUP, signal.SIG_IGN)

    def exit(self):
        os.remove(self.pidfile)
        sys.exit(0)

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
            'signup form received': self.send_signup_confirmation,
            'lessons scheduled': self.send_lesson_confirmation,
            'payment received': self.send_payment_confirmation,
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

    def _send_email(self, record, message, subject,
                    success_status='', error_status=''):
        from_email = self.config.get(self.environment, 'email_sender_address')
        password = self.config.get(self.environment, 'email_sender_password')
        from_name = self.config.get(self.environment, 'email_sender_name')
        to_email = record.get('email', '')
        if not to_email:
            self.set_status('error: email not provided', record)
            return
        if self.test_mode:
            print '-' * 80
            print 'From: {0}'.format(from_email)
            print 'To: {0}'.format(to_email)
            print 'Subject: {0}'.format(subject)
            print message
            print '-' * 80
            return
        email_sent = emailer.send(from_email, password, to_email, subject,
                                  message, sender_name=from_name)
        if email_sent and success_status:
            self.set_status(success_status, record)
        elif not email_sent and error_status:
            self.set_status(error_status, record)

    def _get_cost_str(self, record):
        try:
            cost = int(record.get('cost', 0))
        except ValueError:
            self.set_status('error: cost not valid', record)
            return ''
        if not cost:
            self.set_status('error: cost is zero', record)
            return ''
        return locale.currency(float(cost) / 100.0)

    def send_signup_confirmation(self, record):
        cost_str = self._get_cost_str(record)
        if not cost_str:
            return
        if record.get('customer_id', ''):
            record['payment_message'] = text_strip_margin('''
                |Your credit card will only be charged after you have received your lesson times.
                |The total amount that will be charged is: {0}
            ''').format(cost_str)
        else:
            record['payment_message'] = text_strip_margin('''
                |Your payment by check or cash will be due within five days after you have received your lesson times.
                |The total amount due is: {0}
            ''').format(cost_str)
        template = text_strip_margin('''
            |Thank You!
            |
            |You have completed the signup process at www.swimwithjj.com
            |JJ will contact you with your exact lesson times within the next three weeks.
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
            |Should you have any questions, please do not reply to this email.
            |You can contact me via the website at www.swimwithjj.com.
            ''')
        self._send_email(record, pystache.render(template, record),
                         'Signup Confirmation',
                         success_status='signup confirmation sent',
                         error_status=('error: failed to send '
                                       'signup confirmation email'))

    def send_lesson_confirmation(self, record):
        cost_str = self._get_cost_str(record)
        if not cost_str:
            return
        if record.get('customer_id', ''):
            record['payment_message'] = text_strip_margin('''
                |Payment will be charged to the credit card you provided.
                |The total amount that will be charged is: {0}
            ''').format(cost_str)
        else:
            due_date = date.today() + timedelta(days=6)
            oid = record.get('_id', '')
            record['payment_message'] = text_strip_margin('''
                |Your payment by check or cash will be due by: {due_date:%A, %B %d}
                |
                |Please make checks out to: JJ MENDIOLA
                |
                |Checks can be mailed to:
                |
                |   4241 La Salle Ave.
                |   Culver City, CA 90232
                |
                |
                |Payment is NON-REFUNDABLE.
                |Lesson reservations WILL BE LOST if payment is not received by the due date.
                |
                |The total amount due is: {cost}
                |
                |
                |If you would like to pay by credit card, you may use the following form:
                |
                |http://www.swimwithjj.com/paybycard.html?id={oid}
                |(a fee of 2.9% + 30 cents will be added to your total)
                |
            ''').format(due_date=due_date, cost=cost_str, oid=str(oid))
        template = text_strip_margin('''
            |Your lesson times have been set!
            |
            |You have been scheduled for the following sessions and times:
            |
            |{{#children}}
            |Lessons for {{child_name}}:
            |{{#sessions}}
            |{{.}}
            |{{/sessions}}
            |
            |{{/children}}
            |
            |{{payment_message}}
            |
            |Should you have any questions, please do not reply to this email.
            |You can contact me via the website at www.swimwithjj.com.
            |
            |Thank you and I look forward to seeing you and your little swimmers soon!
            |
            ''')
        self._send_email(record, pystache.render(template, record),
                         'Lesson Time and Payment Info',
                         success_status='lesson confirmation sent',
                         error_status=('error: failed to send '
                                       'lesson confirmation email'))

    def send_payment_confirmation(self, record):
        cost_str = self._get_cost_str(record)
        if not cost_str:
            return
        if record.get('customer_id', ''):
            record['payment_message'] = text_strip_margin('''
                |Payment has been charged to the credit card you provided.
                |
                |Total amount charged: {0}
            ''').format(cost_str)
        else:
            due_date = date.today() + timedelta(days=6)
            oid = record.get('_id', '')
            record['payment_message'] = text_strip_margin('''
                |Your payment has been received.
                |
                |Total amount received: {cost}
            ''').format(due_date=due_date, cost=cost_str, oid=str(oid))
        template = text_strip_margin('''
            |Your payment has been received!
            |
            |The following sessions and times have been reserved:
            |
            |{{#children}}
            |Lessons for {{child_name}}:
            |{{#sessions}}
            |{{.}}
            |{{/sessions}}
            |
            |{{/children}}
            |
            |{{payment_message}}
            |
            |If you need directions to the pool, please see the Lesson Info section on the website.
            |
            |Should you have any questions, please do not reply to this email.
            |You can contact me via the website at www.swimwithjj.com.
            |
            |Thank you and I look forward to seeing you and your little swimmers soon!
            |
            ''')
        self._send_email(record, pystache.render(template, record),
                         'Payment and Lesson Confirmation',
                         success_status='payment confirmation sent',
                         error_status=('error: failed to send '
                                       'payment confirmation email'))


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
