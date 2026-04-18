import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Added this
import { getAuth } from "firebase/auth";           // Added this

const firebaseConfig = {
  apiKey: "AIzaSyCAXQ3S8vG0SlxkCVSt8tr-pPP4G74JPDY",
  authDomain: "payguard-6b2e1.firebaseapp.com",
  projectId: "payguard-6b2e1",
  storageBucket: "payguard-6b2e1.firebasestorage.app",
  messagingSenderId: "515008564050",
  appId: "1:515008564050:web:ecb37ec41c3e804a5c088b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services and Export them
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
