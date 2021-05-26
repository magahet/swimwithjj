import base64
import mock
import main


mock_context_message = mock.Mock()
mock_context_message.event_id = "108622e9-a6ea-400e-90ad-f74301c507e7-0"
mock_context_message.timestamp = "2010-10-10T10:10:10.10Z"
mock_context_message.resource = "projects/swimwithjj-f6a63/databases/(default)/documents/messages/v5sUo7qJZGBIurPqF04i"

mock_context_signup = mock.Mock()
mock_context_signup.event_id = "108622e9-a6ea-400e-90ad-f74301c507e7-0"
mock_context_signup.timestamp = "2010-10-10T10:10:10.10Z"
mock_context_signup.resource = "projects/swimwithjj-f6a63/databases/(default)/documents/signups/v5sUo7qJZGBIurPqF04i"

message = {
    "oldValue": {},
    "updateMask": {},
    "value": {
        "createTime": "2010-10-10T10:10:10.10Z",
        "fields": {
            "created": {
                "timestampValue": "2010-10-10T10:10:10.10Z",
            },
            "email": {"stringValue": "swjjtest@mailinator.com"},
            "message": {"stringValue": "Test message."},
            "name": {"stringValue": "Test User"},
            "phone": {"stringValue": "1234567890"},
        },
        "name": "projects/swimwithjj-f6a63/databases/(default)/documents/messages/v5sUo7qJZGBIurPqF04i",
        "updateTime": "2010-10-10T10:10:10.10Z",
    },
}

signup = {
    "oldValue": {},
    "updateMask": {},
    "value": {
        "createTime": "2021-02-22T02:45:11.084399Z",
        "fields": {
            "parent": {
                "mapValue": {
                    "fields": {
                        "email": {"stringValue": "swjjtest@mailinator.com"},
                        "name": {"stringValue": "Test User"},
                        "phone": {"stringValue": "1234567890"},
                    }
                }
            }
        },
        "name": "projects/swimwithjj-f6a63/databases/(default)/documents/signups/SV9E4wQKKhIHWgRDksS7",
        "updateTime": "2021-02-22T02:45:11.084399Z",
    },
}


def test_get_secret():
    # Test access to mailchimp secret in Secret Manager
    secrets = main.get_secrets()
    assert set(["user", "key", "list"]) == set(secrets.keys())


def test_get_email_messages():
    # Test parsing of data to get email from a message doc
    email = main.get_email(message, mock_context_message)
    assert "swjjtest@mailinator.com" == email


def test_get_email_signups():
    # Test parsing of data to get email from a signup doc
    email = main.get_email(signup, mock_context_signup)
    assert "swjjtest@mailinator.com" == email


def test_process_new_doc_messages(capsys):
    # Integration test to get mailchimp secret and call mailchimp api to add email from a message doc
    main.process_new_doc(message, mock_context_message)
    out, err = capsys.readouterr()
    assert "Hello World!" in out


def test_process_new_doc_signups(capsys):
    # Integration test to get mailchimp secret and call mailchimp api to add email from a signup doc
    main.process_new_doc(signup, mock_context_signup)
    out, err = capsys.readouterr()
    assert "Hello World!" in out
