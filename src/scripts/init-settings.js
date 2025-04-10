// Script to initialize settings in Firestore
// Run with: node src/scripts/init-settings.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config:', {
    apiKey: firebaseConfig.apiKey ? '✓ present' : '✗ missing',
    authDomain: firebaseConfig.authDomain ? '✓ present' : '✗ missing',
    projectId: firebaseConfig.projectId ? '✓ present' : '✗ missing',
    appId: firebaseConfig.appId ? '✓ present' : '✗ missing'
});

// Default settings
const defaultSettings = {
    signupState: "closed",
    lessonInfoActive: false,
    processStates: [
        "signup form received",
        "lessons scheduled"
    ],
    stripePublishKey: process.env.STRIPE_PUBLISH_KEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to initialize settings
const initializeSettings = async () => {
    try {
        const settingsRef = doc(db, 'settings', 'config');
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            // Settings don't exist yet, create them
            await setDoc(settingsRef, defaultSettings);
            console.log('Settings initialized in Firestore:');
            console.log(JSON.stringify(defaultSettings, null, 2));
            return defaultSettings;
        } else {
            // Settings already exist
            const data = settingsSnap.data();
            console.log('Settings already exist in Firestore:');
            console.log(JSON.stringify(data, null, 2));
            return data;
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
        throw error;
    }
};

// Run the initialization
(async () => {
    try {
        console.log('Initializing Firestore settings...');
        await initializeSettings();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize settings:', error);
        process.exit(1);
    }
})(); 