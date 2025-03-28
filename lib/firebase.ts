import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBBwOMghQiz7B9w-fZTmR4gB4K64uFvIPw",
  authDomain: "urbanpulse-397af.firebaseapp.com",
  projectId: "urbanpulse-397af",
  storageBucket: "urbanpulse-397af.firebasestorage.app",
  messagingSenderId: "468220407363",
  appId: "1:468220407363:web:d9c69ea17e7c8f5ba4aef6",
  measurementId: "G-DXLBX2J8EB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { auth, analytics }; 