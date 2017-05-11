#!/usr/bin/env python

import json
import yaml


def to_camel_case(snake_str):
    components = snake_str.split('_')
    # We capitalize the first letter of each component except the first one
    # with the 'title' method and join them together.
    return components[0] + "".join(x.title() for x in components[1:])


def convert_keys(obj):
    if isinstance(obj, dict):
        return {to_camel_case(k): convert_keys(v) for k, v in obj.iteritems()}
    elif isinstance(obj, list):
        return [convert_keys(o) for o in obj]
    else:
        return obj


def get_config():
    try:
        with open('/etc/swimwithjj/webapp.yaml') as file_:
            return {
                'status': 'success',
                'data': convert_keys(yaml.load(file_))
            }
    except Exception as error:
        return {
            'status': 'error',
            'message': str(error)
        }


if __name__ == "__main__":
    print 'Content-type: application/json\n'
    print json.dumps(get_config(), indent=2)
