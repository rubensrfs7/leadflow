import { initializeApp } from "firebase/app";
import { getFirestore, collection, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

let app: any;
let db: Firestore;
let auth: Auth;

function getFirebase() {
  if (!app) {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase API key is missing. Please check your environment variables.");
    }

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { db, auth };
}

export { getFirebase };
export const getDb = () => getFirebase().db;
export const getAuthInstance = () => getFirebase().auth;

export const getLeadsCollection = () => collection(getDb(), "leads");
export const getWebhookLogsCollection = () => collection(getDb(), "webhookLogs");
export const getSettingsCollection = () => collection(getDb(), "settings");
