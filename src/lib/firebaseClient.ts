// Client-side Firebase utility functions
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';

// Auth functions
export const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
    return firebaseSignOut(auth);
};

export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

// Firestore functions
export const createDocument = (collectionName: string, data: any) => {
    return addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
    });
};

export const updateDocument = (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    return updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
    });
};

export const deleteDocument = (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    return deleteDoc(docRef);
};

export const getDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

export const getDocuments = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const queryDocuments = async (collectionName: string, field: string, value: any) => {
    const q = query(collection(db, collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

// Storage functions
export const uploadFile = async (path: string, file: File) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
        path,
        url: downloadURL
    };
};

export const deleteFile = (path: string) => {
    const storageRef = ref(storage, path);
    return deleteObject(storageRef);
}; 