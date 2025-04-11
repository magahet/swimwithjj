// Utility to initialize Firestore settings collection
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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

// Function to initialize or update the settings in Firestore
export const initializeSettings = async () => {
    try {
        const settingsRef = doc(db, 'settings', 'config');
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
            // Settings don't exist yet, create them
            await setDoc(settingsRef, defaultSettings);
            console.log('Settings initialized in Firestore');
            return defaultSettings;
        } else {
            // Settings already exist
            console.log('Settings already exist in Firestore');
            return settingsSnap.data();
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
        throw error;
    }
};

// Function to get the current settings
export const getSettings = async () => {
    try {
        const settingsRef = doc(db, 'settings', 'config');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
            return settingsSnap.data();
        } else {
            // Instead of initializing settings, throw an error
            throw new Error('Settings do not exist in Firebase. Please create the settings collection first.');
        }
    } catch (error) {
        console.error('Error getting settings:', error);
        throw error;
    }
};

// Function to update specific settings
export const updateSettings = async (updatedSettings: Partial<typeof defaultSettings>) => {
    try {
        const settingsRef = doc(db, 'settings', 'config');
        await setDoc(settingsRef, updatedSettings, { merge: true });
        console.log('Settings updated successfully');
        return await getSettings();
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
}; 