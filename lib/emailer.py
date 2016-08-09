#!/usr/bin/python

import smtplib
from email.MIMEText import MIMEText
import string


def send(sender_address, password, receivers,
         subject, message, sender_name=''):
    if not isinstance(receivers, list):
        receivers = [receivers]
    msg = MIMEText(filter(lambda x: x in string.printable, message))
    msg['Subject'] = subject
    sender_name = sender_name if sender_name else sender_address
    msg['From'] = '{0} <{1}>'.format(sender_name, sender_address)
    msg['To'] = (', ').join(receivers)
    try:
        session = smtplib.SMTP('smtp.gmail.com', 587)
        session.ehlo()
        session.starttls()
        session.ehlo()
        session.login(sender_address, password)
        session.sendmail(sender_address, receivers, msg.as_string())
        session.quit()
        return True
    except smtplib.SMTPException:
        return False
