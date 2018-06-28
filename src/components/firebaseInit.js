import firebase from 'firebase'
import 'firebase/firestore'
import firebaseConfig from './firebaseConfig'

// firebase init goes here
firebase.initializeApp(firebaseConfig)

// firebase utils
const db = firebase.firestore()
// const auth = firebase.auth()
// const currentUser = auth.currentUser

// date issue fix according to firebase
const settings = {
    timestampsInSnapshots: true
}
db.settings(settings)

// firebase collections
const signups = db.collection('signups')
const ts = firebase.firestore.FieldValue.serverTimestamp

export default {
    db,
    signups,
    ts,
}