/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// These would normally be in firebase-applet-config.json
// But since the tool failed, we'll use environment variables or placeholders
const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID
  };

  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingRequired = requiredKeys.filter(key => {
    const val = config[key as keyof typeof config];
    return !val || String(val).trim() === '' || String(val).trim() === 'undefined' || String(val).trim() === 'null';
  });

  if (missingRequired.length > 0) {
    console.warn(`Missing or invalid required Firebase environment variables: ${missingRequired.join(', ')}. Please configure them in the Secrets panel.`);
    return null;
  }

  // Ensure all values are strings and strictly trimmed to avoid DOMExceptions in Firebase SDK
  const cleanConfig = {
    apiKey: String(config.apiKey).trim().replace(/["']/g, ''),
    authDomain: String(config.authDomain).trim().replace(/["']/g, ''),
    projectId: String(config.projectId).trim().replace(/["']/g, ''),
    storageBucket: config.storageBucket ? String(config.storageBucket).trim().replace(/["']/g, '') : undefined,
    messagingSenderId: config.messagingSenderId ? String(config.messagingSenderId).trim().replace(/["']/g, '') : undefined,
    appId: String(config.appId).trim().replace(/["']/g, '')
  };

  return cleanConfig;
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase only if we have a valid config
let app;
let auth: any;
let db: any;
let googleProvider: any;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    // Force account selection on every sign-in to ensure users can switch accounts
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export { auth, db, googleProvider };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error("Firebase is not fully configured. Please ensure your Firebase secrets (VITE_FIREBASE_API_KEY, etc.) are set in the Secrets panel. If you just added them, try refreshing the page or restarting the dev server. Also, ensure they have the 'VITE_' prefix.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    // Provide a more helpful message for common errors
    if (error.message && error.message.includes("invalid or illegal string")) {
      throw new Error("Google Sign-In failed due to an invalid configuration string. Please double-check your Firebase Secrets for extra spaces or hidden characters.");
    }
    if (error.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname;
      throw new Error(`This domain (${currentDomain}) is not authorized in your Firebase project. Please add it to the 'Authorized domains' list in the Firebase Console under Authentication > Settings.`);
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Sign-in was cancelled because a previous sign-in request was still pending. Please wait a moment and try again.");
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("The sign-in popup was closed before completion. Please try again and complete the sign-in process in the popup window.");
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    }
    throw error;
  }
};

export const firebaseLogout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
