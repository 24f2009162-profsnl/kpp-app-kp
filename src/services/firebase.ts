/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Helper to clean keys (removes accidental quotes/spaces from Vercel/Env)
const cleanValue = (val: any) => {
  if (!val) return undefined;
  const cleaned = String(val).trim().replace(/["']/g, '');
  return cleaned === 'undefined' || cleaned === 'null' || cleaned === '' ? undefined : cleaned;
};

const firebaseConfig = {
  apiKey: cleanValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanValue(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: cleanValue(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) 
};

// Check for the bare minimum to initialize
const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app;
let auth: any;
let db: any;
let googleProvider: any;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export { auth, db, googleProvider };

export const signInWithGoogle = async () => {
  if (!isConfigValid || !auth || !googleProvider) {
    throw new Error("Firebase Configuration Missing: Please ensure VITE_FIREBASE_API_KEY and other variables are set in your Vercel Environment Settings.");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);

    // Domain Whitelist Check
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(`Domain ${window.location.hostname} is not authorized. Add it in Firebase Console > Auth > Settings > Authorized Domains.`);
    }

    // Popup issues
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Sign-in window closed. Please try again.");
    }

    throw error;
  }
};

export const firebaseLogout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

// Error handling for Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore ${operationType} error at ${path}:`, error);
  throw error;
}
