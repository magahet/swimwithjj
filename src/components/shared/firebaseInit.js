import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import firebaseConfig from '@/components/shared/firebaseConfig'

// firebase init goes here
firebase.initializeApp(firebaseConfig)

// firebase utils
const auth = firebase.auth()
const db = firebase.firestore()
// const currentUser = auth.currentUser

// date issue fix according to firebase
const settings = {
    timestampsInSnapshots: true
}
db.settings(settings)

// firebase collections
// const year = (new Date()).getFullYear()

const users = db.collection('users')
const signups = db.collection('signups')
const waitlist = db.collection('waitlist')
const messages = db.collection('messages')

const ts = firebase.firestore.FieldValue.serverTimestamp

export default {
    auth,
    db,
    users,
    signups,
    waitlist,
    messages,
    ts,
}