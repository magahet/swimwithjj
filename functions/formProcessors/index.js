const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const admin = require('firebase-admin')
const functions = require('firebase-functions')

admin.initializeApp()

const signupChanged = require('./signup-changed')
exports.signupChanged = signupChanged.signupChanged

const signupNew = require('./signup-new')
exports.signupNew = signupNew.signupNew

const messageSend = require('./message-send')
exports.messageSend = messageSend.messageSend