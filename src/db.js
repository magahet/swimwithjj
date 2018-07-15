import firebase from './firebase';

const firestore = firebase.firestore();
const ts = firebase.firestore.FieldValue.serverTimestamp

export {
  firestore,
  ts,
}