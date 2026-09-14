import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDjN-YXYzE9ifVaabwIZHVVybFKa6IU4As",
  authDomain: "kaviyam-reading-b3e8e.firebaseapp.com",
  databaseURL: "https://kaviyam-reading-b3e8e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kaviyam-reading-b3e8e",
  storageBucket: "kaviyam-reading-b3e8e.firebasestorage.app",
  messagingSenderId: "1062572384882",
  appId: "1:1062572384882:web:3eedfb491aa7e3f21098eb",
  measurementId: "G-VJ7RZT6K0B"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Analytics safely for browser environments
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
