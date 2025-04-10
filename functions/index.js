// Load environment variables
require('dotenv').config();

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const admin = require('firebase-admin')
const { onRequest, onCall } = require('firebase-functions/v2/https')
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore')

admin.initializeApp()

const signupChanged = require('./signup-changed')
exports.signupChanged = signupChanged.signupChanged

const signupNew = require('./signup-new')
exports.signupNew = signupNew.signupNew

const messageSend = require('./message-send')
exports.messageSend = messageSend.messageSend

// MailChimp subscription functions
const mailchimpSubscribe = require('./mailchimp-subscribe')
exports.signupSubscribe = mailchimpSubscribe.signupSubscribe
exports.messageSubscribe = mailchimpSubscribe.messageSubscribe