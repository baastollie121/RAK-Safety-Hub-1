import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC7IIpgfevDfFxNHUyYisL14nfIIw9yV64",
  authDomain: "rak-safety-hub-n0boo.firebaseapp.com",
  projectId: "rak-safety-hub-n0boo",
  storageBucket: "rak-safety-hub-n0boo.appspot.com",
  messagingSenderId: "430274132305",
  appId: "1:430274132305:web:3cdadf32d6b186843b3b70",
  measurementId: "G-D6DSZFWTP9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Conditionally initialize analytics only on the client side
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, db, storage, analytics };
