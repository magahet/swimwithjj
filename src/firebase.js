import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// firebase init goes here
firebase.initializeApp({
  apiKey: "AIzaSyCH00xjW2KndA3No4QPxVVi3YbQFQxPync",
  authDomain: "swimwithjj-f6a63.firebaseapp.com",
  databaseURL: "https://swimwithjj-f6a63.firebaseio.com",
  projectId: "swimwithjj-f6a63",
  storageBucket: "swimwithjj-f6a63.appspot.com",
  messagingSenderId: "582128058106",
})

// date issue fix according to firebase
firebase.firestore().settings({timestampsInSnapshots: true})

export default firebase