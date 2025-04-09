// Admin script to initialize settings in Firestore
// Using Firebase Admin SDK with full admin privileges
// Run with: node src/scripts/admin-init-settings.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Try to load service account file
let serviceAccount;
try {
    // Try to load from file in project root
    const serviceAccountPath = resolve(__dirname, '../../serviceAccountKey.json');
    console.log(`Looking for service account key at: ${serviceAccountPath}`);
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    console.log('✓ Service account key loaded successfully');
} catch (error) {
    console.error('Error loading service account key from file:', error.message);
    console.log('Please provide a service account key file (serviceAccountKey.json) in project root');
    console.log('You can download it from Firebase Console > Project Settings > Service accounts');
    process.exit(1);
}

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

// Get Firestore instance with admin privileges
const db = getFirestore();

// Default settings based on the old settings.json, excluding sessionList and months
const defaultSettings = {
    signupState: "closed",
    lessonInfoActive: false,
    processStates: [
        "signup form received",
        "lessons scheduled"
    ],
    stripePublishKey: "pk_live_mfTxbsnXY6f9fXZJAR17EajZ"
};

// Function to initialize settings
const initializeSettings = async () => {
    try {
        const settingsRef = db.collection('settings').doc('config');
        const settingsDoc = await settingsRef.get();

        if (!settingsDoc.exists) {
            // Settings don't exist yet, create them
            await settingsRef.set(defaultSettings);
            console.log('Settings initialized in Firestore:');
            console.log(JSON.stringify(defaultSettings, null, 2));
            return defaultSettings;
        } else {
            // Settings already exist
            const data = settingsDoc.data();
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
        console.log('Initializing Firestore settings with admin privileges...');
        await initializeSettings();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize settings:', error);
        process.exit(1);
    }
})(); 