// Utility functions for managing sessions in Firestore
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';
import { db } from './firebase';

// Import Session type
// Since the Session type is defined in global.d.ts, we need to reference it
// without importing it directly, as it's already in the global namespace
type SessionType = Session;

const COLLECTION_NAME = 'sessions';

// Get all sessions
export const getAllSessions = async (): Promise<SessionType[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SessionType));
    } catch (error) {
        console.error('Error getting sessions:', error);
        throw error;
    }
};

// Get open sessions (for signup form)
export const getOpenSessions = async (): Promise<SessionType[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), where('open', '==', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SessionType));
    } catch (error) {
        console.error('Error getting open sessions:', error);
        throw error;
    }
};

// Get session by ID
export const getSession = async (id: string): Promise<SessionType | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as SessionType;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error getting session ${id}:`, error);
        throw error;
    }
};

// Create new session
export const createSession = async (sessionData: Omit<SessionType, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionType> => {
    try {
        // Find the next available ID
        const sessions = await getAllSessions();
        const existingIds = sessions.map(s => parseInt(s.id));
        const nextId = Math.max(...existingIds, 0) + 1;

        const newSession: SessionType = {
            id: nextId.toString(),
            ...sessionData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const sessionRef = doc(db, COLLECTION_NAME, newSession.id);
        await setDoc(sessionRef, newSession);

        return newSession;
    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
};

// Update session
export const updateSession = async (id: string, sessionData: Partial<Omit<SessionType, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SessionType> => {
    try {
        const sessionRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(sessionRef);

        if (!docSnap.exists()) {
            throw new Error(`Session with ID ${id} does not exist`);
        }

        const updatedData = {
            ...sessionData,
            updatedAt: new Date()
        };

        await updateDoc(sessionRef, updatedData);

        // Get the updated document
        const updatedSnap = await getDoc(sessionRef);
        return { id, ...updatedSnap.data() } as SessionType;
    } catch (error) {
        console.error(`Error updating session ${id}:`, error);
        throw error;
    }
};

// Delete session
export const deleteSession = async (id: string): Promise<void> => {
    try {
        const sessionRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(sessionRef);
    } catch (error) {
        console.error(`Error deleting session ${id}:`, error);
        throw error;
    }
};

// Toggle session open/closed status
export const toggleSessionStatus = async (id: string): Promise<SessionType> => {
    try {
        const session = await getSession(id);

        if (!session) {
            throw new Error(`Session with ID ${id} does not exist`);
        }

        return await updateSession(id, { open: !session.open });
    } catch (error) {
        console.error(`Error toggling session ${id} status:`, error);
        throw error;
    }
}; 