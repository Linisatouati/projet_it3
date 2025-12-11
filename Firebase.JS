// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (copié depuis la console)
const firebaseConfig = {
  apiKey: "AIzaSyDM2jPaCv30Goat6_labd6Eszc--u7g8xE",
  authDomain: "cloudit3-4722b.firebaseapp.com",
  projectId: "cloudit3-4722b",
  storageBucket: "cloudit3-4722b.firebasestorage.app",
  messagingSenderId: "301313914854",
  appId: "1:301313914854:web:a53151373120b16b260827",
  measurementId: "G-ZWVZM08EBG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

