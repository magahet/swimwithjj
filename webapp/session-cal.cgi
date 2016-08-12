#!/usr/bin/env python


def main():
    print "Content-Type: text/html\n"
    with open('session-cal.html', 'r') as file_:
        print file_.read()


if __name__ == '__main__':
    main()
