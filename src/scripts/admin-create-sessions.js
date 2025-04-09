// Admin script to create sessions collection in Firestore
// Using Firebase Admin SDK with full admin privileges
// Run with: node src/scripts/admin-create-sessions.js

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

// Session data from settings.json (without dateList as specified)
const sessions = [
    {
        id: "1",
        open: false,
        price: 280,
        dates: "May 28 - June 13",
        days: "Tuesday to Thursday",
        times: "30 minute lessons between 2:00pm and 4:00pm"
    },
    {
        id: "2",
        open: false,
        price: 250,
        dates: "June 17 - 27 (morning)",
        days: "Monday to Thursday",
        times: "30 minute lessons between 9:30am and 12:00pm"
    },
    {
        id: "3",
        open: false,
        price: 250,
        dates: "June 17 - 27 (early afternoon)",
        days: "Monday to Thursday",
        times: "30 minute lessons between 1:00pm and 3:00pm"
    },
    {
        id: "4",
        open: false,
        price: 250,
        dates: "June 17 - 27 (late afternoon)",
        days: "Monday to Thursday",
        times: "30 minute lessons between 4:00pm and 6:00pm"
    },
    {
        id: "5",
        open: false,
        price: 250,
        dates: "July 1 - 11 (morning)",
        days: "Monday to Thursday",
        times: "30 minute lessons between 9:30am and 12:00pm"
    },
    {
        id: "6",
        open: true,
        price: 250,
        dates: "July 1 - 11 (afternoon)",
        days: "Monday to Thursday",
        times: "30 minute lessons between 1:00pm and 3:00pm"
    },
    {
        id: "7",
        open: true,
        price: 188,
        dates: "July 15, 16, 17, 18",
        days: "Monday to Thursday",
        times: "45 minute lessons between 9:30am and 11:45pm",
        notes: "Need 6-8 kids minimum to hold session"
    },
    {
        id: "8",
        open: true,
        price: 188,
        dates: "July 29, 30, 31, August 1",
        days: "Monday to Thursday",
        times: "45 minute lessons between 9:30am and 12:30pm",
        notes: "Need 6-8 kids minimum to hold session"
    },
    {
        id: "9",
        open: true,
        price: 280,
        dates: "August 27, 28, 29, September 3, 4, 5, 10, 11, 12",
        days: "Tuesday to Friday",
        times: "30 minute lessons between 1:30pm and 4:00pm"
    }
];

// Function to create sessions in Firestore
const createSessions = async () => {
    try {
        console.log('Creating sessions collection in Firestore...');

        // Loop through sessions and add each as a document
        for (const session of sessions) {
            // Add timestamps
            const sessionData = {
                ...session,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Set the document with the session data
            await db.collection('sessions').doc(session.id).set(sessionData);
            console.log(`Session ${session.id} created successfully.`);
        }

        console.log('All sessions created successfully!');
        return true;
    } catch (error) {
        console.error('Error creating sessions:', error);
        return false;
    }
};

// Run the function
createSessions().then((success) => {
    console.log('Script completed.');
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
}); 