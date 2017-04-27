#!/usr/bin/env python

import argparse
import calendar


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create html calendar.')
    parser.add_argument('year', type=int, help='year')
    parser.add_argument('month', type=int, help='month')
    args = parser.parse_args()

    tc = calendar.HTMLCalendar(6)
    print tc.formatmonth(args.year, args.month)
