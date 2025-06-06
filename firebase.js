// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyD6evxbR43KZPJzK3hrTcdjPQupoYL9JoM',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'samosa-clicker.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'samosa-clicker',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'samosa-clicker.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '662486199675',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:662486199675:web:65b6b736bec4d2bd6261de',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CXXHHYWNV0',
};

// Debug: Log the config
console.log('🔥 Firebase Config Check:');
console.log('API Key:', firebaseConfig.apiKey ? '✅ Loaded' : '❌ Missing');
console.log(
  'Auth Domain:',
  firebaseConfig.authDomain ? '✅ Loaded' : '❌ Missing',
);
console.log(
  'Project ID:',
  firebaseConfig.projectId ? '✅ Loaded' : '❌ Missing',
);
console.log('Full config:', firebaseConfig);

// Validate required fields
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter((field) => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('❌ Missing required Firebase config fields:', missingFields);
  throw new Error(
    `Missing Firebase configuration: ${missingFields.join(', ')}`,
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

export default app;
