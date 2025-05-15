import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAsvi8GsTs0YaSTG-ytSOETvyi5zdXFplY",
  authDomain: "urbanpulse-39a52.firebaseapp.com",
  projectId: "urbanpulse-39a52",
  storageBucket: "urbanpulse-39a52.firebasestorage.app",
  messagingSenderId: "244835200703",
  appId: "1:244835200703:web:efe2cb1e708f05a6c8600a",
  measurementId: "G-LVGMR17S9Y"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);

  // Initialize Analytics only on the client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase');
}

export { app, auth, analytics, db }; 