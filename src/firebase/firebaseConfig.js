import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            "AIzaSyB3eIX9lE11ZyGykZotuX88iW5sSEZoSS4",
  authDomain:        "mi-bitacora-7403d.firebaseapp.com",
  projectId:         "mi-bitacora-7403d",
  storageBucket:     "mi-bitacora-7403d.firebasestorage.app",
  messagingSenderId: "437285595735",
  appId:             "1:437285595735:web:e4cb37579a8c4d3ed81112"
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;