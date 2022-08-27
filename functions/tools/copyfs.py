#!/usr/bin/env python


import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


def move_doc(source_collection, target_collection, doc_id):
    doc_ref = db.collection(source_collection).document(doc_id)
    doc = doc_ref.get().to_dict()
    return db.collection(target_collection).document(doc_id).set(doc)


if __name__ == "__main__":
    cred = credentials.Certificate(
        "/mnt/media/credentials/swimwithjj-f6a63-firebase-adminsdk-j40yb-005b1cbd6d.json"
    )
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    doc_id = "Gar Mendiola - 2022-08-25T18:50:11-07:00"

    move_doc("signups", "signupsTest", doc_id)
