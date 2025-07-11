import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCf-pXsJRMPg6W98FRZlSTH7a-j73obFmM",
  authDomain: "rak-safety-management-sy-fwpk7.firebaseapp.com",
  projectId: "rak-safety-management-sy-fwpk7",
  storageBucket: "rak-safety-management-sy-fwpk7.appspot.com",
  messagingSenderId: "918303719545",
  appId: "1:918303719545:web:96ac79845b65240b3094a8",
  measurementId: "G-89P1ND38QR"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
