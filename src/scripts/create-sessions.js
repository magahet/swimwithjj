// Script to create sessions collection in Firestore
// Run with: node src/scripts/create-sessions.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
            const sessionRef = doc(db, 'sessions', session.id);

            // Add timestamps
            const sessionData = {
                ...session,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Set the document with the session data
            await setDoc(sessionRef, sessionData);
            console.log(`Session ${session.id} created successfully.`);
        }

        console.log('All sessions created successfully!');
    } catch (error) {
        console.error('Error creating sessions:', error);
    }
};

// Run the function
createSessions().then(() => {
    console.log('Script completed.');
    process.exit(0);
}).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
}); 