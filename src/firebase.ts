import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDjN-YXYzE9ifVaabwIZHVVybFKa6IU4As",
  authDomain: "kaviyam-reading-b3e8e.firebaseapp.com",
  projectId: "kaviyam-reading-b3e8e",
  storageBucket: "kaviyam-reading-b3e8e.firebasestorage.app",
  messagingSenderId: "1062572384882",
  appId: "1:1062572384882:web:a954fe295ab9e1111098eb"
};

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);


