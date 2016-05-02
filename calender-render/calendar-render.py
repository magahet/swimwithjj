#!/usr/bin/env python

import calendar
import sys


def render_month(year, month):
    calendar.setfirstweekday(6)
    return '\n'.join([
        '<tr>{}</tr>'.format(render_week(w)) for
        w in calendar.monthcalendar(year, month)
    ])


def render_week(days):
    filter_zero = lambda x: x if x != 0 else ''
    return ''.join([
        '<td>{}</td>'.format(filter_zero(d)) for
        d in days
    ])


if __name__ == '__main__':
    year, month = int(sys.argv[1]), int(sys.argv[2])
    print render_month(year, month)
