from google.cloud import firestore


def update_document(context, update):
    client = firestore.Client()
    path_parts = context.resource.split("/documents/")[1].split("/")
    collection_path = path_parts[0]
    document_path = "/".join(path_parts[1:])
    affected_doc = client.collection(collection_path).document(document_path)
    affected_doc.set(update)