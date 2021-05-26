import json
import logging

from google.cloud import secretmanager
from mailchimp3 import MailChimp


MAILCHIMP_SECRETS = "mailchimp"
PROJECT_ID = "swimwithjj-f6a63"

logger = logging.getLogger(__name__)


def process_new_doc(data, context):
    """Triggered by a change to a Firestore document.
    Args:
        data (dict): The event payload.
        context (google.cloud.functions.Context): Metadata for the event.
    """
    # TODO get email address from data.get('value')
    email_address = get_email(data, context)
    if not email_address:
        logger.error("Could not find email in doc [%s]", data.get("value"))
        return

    logger.info("Adding email to mailchimp list [%s]", email_address)
    secrets = get_secrets()
    client = MailChimp(mc_api=secrets.get("key"), mc_user=secrets.get("user"))
    response = client.lists.members.create(
        secrets.get("list"),
        {
            "email_address": email_address,
            "status": "subscribed",
        },
    )
    logger.info(str(response))


def get_email(data, context):
    # look up email field based on which collection was updated
    fields = data["value"]["fields"]
    collection = context.resource.split("/documents/")[1].split("/")[0]
    cases = {
        "signups": lambda f: f["parent"]["mapValue"]["fields"]["email"]["stringValue"],
        "messages": lambda f: f["email"]["stringValue"],
    }
    if collection not in cases:
        return None
    return cases.get(collection)(fields)


def get_secrets():
    client = secretmanager.SecretManagerServiceClient()
    request = {
        "name": f"projects/{PROJECT_ID}/secrets/{MAILCHIMP_SECRETS}/versions/latest"
    }
    response = client.access_secret_version(request)
    return json.loads(response.payload.data.decode("UTF-8"))