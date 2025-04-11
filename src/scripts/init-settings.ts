// Script to initialize settings in Firestore
// Run with: npx ts-node src/scripts/init-settings.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { initializeSettings } from '../lib/initSettings';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize settings
const init = async () => {
    try {
        console.log('Initializing Firestore settings...');
        const settings = await initializeSettings();
        console.log('Settings initialized successfully:');
        console.log(JSON.stringify(settings, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error initializing settings:', error);
        process.exit(1);
    }
};

// Run the initialization
init(); 