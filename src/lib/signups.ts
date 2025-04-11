// Utility functions for managing signups in Firestore
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from './firebase';

// Define the Signup type based on the Firestore document structure
export interface SignupChild {
    id: number;
    name: string;
    birthday: string;
    level: string;
    sessions: {
        id: number;
        text: string;
        time: string;
    }[];
}

export interface Signup {
    id: string;
    parent: {
        name: string;
        email: string;
        phone: string;
    };
    children: SignupChild[];
    request?: string;
    status: string;
    paymentTotal: number;
    paymentMethodId: string;
    stripeCustomerId: string;
    created: {
        _seconds: number;
        _nanoseconds: number;
    };
}

const COLLECTION_NAME = 'signups';

// Get all signups
export const getAllSignups = async (): Promise<Signup[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('created', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Signup));
    } catch (error) {
        console.error('Error getting signups:', error);
        throw error;
    }
};

// Get signup by ID
export const getSignup = async (id: string): Promise<Signup | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Signup;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error getting signup ${id}:`, error);
        throw error;
    }
};

// Get signups by session ID
export const getSignupsBySession = async (sessionId: number): Promise<Signup[]> => {
    try {
        const signups = await getAllSignups();

        // Filter signups where at least one child is registered for the specified session
        return signups.filter(signup => {
            return signup.children.some(child =>
                child.sessions.some(session => session.id === sessionId)
            );
        });
    } catch (error) {
        console.error(`Error getting signups for session ${sessionId}:`, error);
        throw error;
    }
};

// Update signup
export const updateSignup = async (id: string, signupData: Partial<Signup>): Promise<Signup> => {
    try {
        console.log(`[Firebase] Updating signup ${id} with data:`, JSON.stringify(signupData));

        const signupRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(signupRef);

        if (!docSnap.exists()) {
            console.error(`[Firebase] Signup with ID ${id} does not exist`);
            throw new Error(`Signup with ID ${id} does not exist`);
        }

        console.log(`[Firebase] Existing signup data:`, JSON.stringify(docSnap.data()));

        console.log(`[Firebase] Calling updateDoc with:`, signupData);
        await updateDoc(signupRef, signupData);
        console.log(`[Firebase] updateDoc completed successfully`);

        // Get the updated document
        const updatedSnap = await getDoc(signupRef);
        console.log(`[Firebase] Updated document data:`, JSON.stringify(updatedSnap.data()));

        return { id, ...updatedSnap.data() } as Signup;
    } catch (error) {
        console.error(`[Firebase] Error updating signup ${id}:`, error);
        throw error;
    }
};

// Update signup status
export const updateSignupStatus = async (id: string, status: string): Promise<Signup> => {
    try {
        return await updateSignup(id, { status });
    } catch (error) {
        console.error(`Error updating status for signup ${id}:`, error);
        throw error;
    }
};

// Delete signup
export const deleteSignup = async (id: string): Promise<void> => {
    try {
        const signupRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(signupRef);
    } catch (error) {
        console.error(`Error deleting signup ${id}:`, error);
        throw error;
    }
}; 