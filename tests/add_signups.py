#!/usr/bin/python2.7

import stripe
import random
from datetime import date, datetime, timedelta
from pymongo import MongoClient
import ConfigParser
import argparse


with open('mock-data/names') as file_:
    names = [n.strip() for n in file_.readlines()]
with open('mock-data/cards') as file_:
    cards = [n.strip() for n in file_.readlines()]
with open('mock-data/quotes') as file_:
    quotes = [n.strip() for n in file_.readlines()]
locations = ['laCrescenta', 'culverCity']
swim_levels = [
    "uncomfortable putting their face in the water",
    "comfortable putting their face in the water",
    "can swim the width of a pool",
    "advanced swimmer, can swim length of a pool"
]
sessions = {
    'laCrescenta': [
        {'name': 'Session 1 - June 5th to June 20th - Morning', 'price': 189},
        {'name': 'Session 1 - June 5th to June 20th - Afternoon', 'price': 189},
        {'name': 'Session 2 - June 25th to July 11th - Morning', 'price': 189},
        {'name': 'Session 2 - June 25th to July 11th - Afternoon', 'price': 189},
        {'name': 'Session 3 - July 20th to August 4th - Afternoon', 'price': 126},
    ],
    'culverCity': [
        {'name': 'Session 1 - May 17th to June 2nd - Afternoon', 'price': 189},
        {'name': 'Session 2 - June 14th to June 30th - Afternoon', 'price': 189},
        {'name': 'Session 3 - July 16th to August 1th - Morning', 'price': 189},
        {'name': 'Session 3 - July 16th to August 31th - Afternoon', 'price': 189},
        {'name': 'Session 4 - August 6th to August 22nd - Morning', 'price': 189},
        {'name': 'Session 4 - August 6th to August 22nd - Afternoon', 'price': 189},
    ]
}


def generate_customer():
    customer = stripe.Customer.create(
        card={
            'number': random.choice(cards),
            'exp_month': str(random.randint(1, 12)),
            'exp_year': str(random.randint(2014, 2020)),
            'cvc': str(random.randint(100, 999))
        }
    )
    return customer.id


def random_date():
    start_date = date(2003, 1, 1).toordinal()
    end_date = date(2012, 1, 1).toordinal()
    return date.fromordinal(random.randint(start_date, end_date)).isoformat()


def generate_child(location):
    my_sessions = sessions[location][:]
    random.shuffle(my_sessions)
    childs_sessions = [my_sessions.pop() for i in range(random.randint(1, 3))]
    cost = [c['price'] for c in childs_sessions]
    return ({
        'swim_level': random.choice(swim_levels),
        'child_name': random.choice(names),
        'birthday': random_date(),
        'sessions': [c['name'] for c in childs_sessions]
    }, sum(cost))


def generate_signup():
    name = random.choice(names)
    location = random.choice(locations)
    child_list = []
    total_cost = 0
    for i in range(random.randrange(1, 3)):
        (child_info, cost) = generate_child(location)
        child_list.append(child_info)
        total_cost += cost
    if random.choice([True, False]):
        customer_id = generate_customer()
        total_cost = int((total_cost * 102.9) + 30)
    else:
        customer_id = None
        total_cost = total_cost * 100
    return {
        'name': name,
        'customer_id': customer_id,
        'timestamp': datetime.utcnow() - timedelta(hours=random.randint(1, 5000)),
        'request': random.choice(quotes),
        'email': '{0}@gmail.com'.format(name.replace(' ', '')),
        'phone': '555-555-{0}'.format(random.randint(1000, 9999)),
        'payment_received': False,
        'cost': total_cost,
        'location': location,
        'children': child_list,
    }


def load_signups(num, environment='test'):
    conn = MongoClient()
    db = conn.swimwithjj
    signup = db.signup
    for i in range(num + 1):
        signup.insert(generate_signup())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('num', help='number of signups to create', type=int)
    parser.add_argument('-e', '--env', help='environment', default='test')
    args = parser.parse_args()
    config = ConfigParser.ConfigParser()
    stripe.api_key = config.get(args.env, 'stripe_secret_key')
    load_signups(args.num, environment=args.env)
