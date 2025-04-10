// Global type definitions for Firebase helpers

interface SiteSettings {
    signupState: string;
    lessonInfoActive: boolean;
    processStates: string[];
    stripePublishKey: string;
    [key: string]: any; // Allow for additional properties
}

interface Session {
    id: string;
    open: boolean;
    price: number;
    dates: string;
    days: string;
    times: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface SignupChild {
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

interface Signup {
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

interface FirebaseAuthUtils {
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    getCurrentUser: () => Promise<any>;
}

interface Window {
    firebaseUpload: (path: string, file: File) => Promise<{ path: string, url: string }>;
    firebaseDB: {
        create: (collection: string, data: any) => Promise<any>;
        get: (collection: string, id: string) => Promise<any>;
    };
    firebaseAuthUtils: FirebaseAuthUtils;
    siteSettings: SiteSettings;
    updateSiteSettings: (newSettings: Partial<SiteSettings>) => Promise<SiteSettings>;
    getSessions: () => Promise<Session[]>;
}

export { }; 