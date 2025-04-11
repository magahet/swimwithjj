// Script to fetch and display signups collection from Firestore
// Using Firebase Admin SDK with full admin privileges
// Run with: node src/scripts/get-signups.js

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

// Initialize Firebase Admin with service account
let serviceAccount;
try {
    // Try to load service account from file
    const serviceAccountPath = resolve(process.cwd(), 'serviceAccountKey.json');
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    console.log('Service account key loaded successfully');
} catch (error) {
    console.error('Error loading service account key:', error);
    console.error('Please make sure you have a serviceAccountKey.json file in the project root.');
    console.error('See SERVICE_ACCOUNT_SETUP.md for instructions.');
    process.exit(1);
}

// Initialize Firebase Admin SDK
initializeApp({
    credential: cert(serviceAccount)
});

// Get Firestore instance with admin privileges
const db = getFirestore();

// Function to fetch all signups
const getSignups = async () => {
    try {
        console.log('Fetching signups from Firestore...');

        const signupsRef = db.collection('signups');
        const snapshot = await signupsRef.get();

        if (snapshot.empty) {
            console.log('No signups found in the collection.');
            return [];
        }

        const signups = [];
        snapshot.forEach(doc => {
            signups.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`Found ${signups.length} signup(s).`);
        console.log(JSON.stringify(signups, null, 2));

        return signups;
    } catch (error) {
        console.error('Error fetching signups:', error);
        return [];
    }
};

// Run the function
getSignups().then((signups) => {
    console.log('Script completed.');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
}); 