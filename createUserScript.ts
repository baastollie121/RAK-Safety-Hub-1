
// This is a temporary script to create a user in Firebase Authentication.
// We will delete this file after the user is created.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7IIpgfevDfFxNHUyYisL14nfIIw9yV64",
  authDomain: "rak-safety-hub-n0boo.firebaseapp.com",
  projectId: "rak-safety-hub-n0boo",
  storageBucket: "rak-safety-hub-n0boo.appspot.com",
  messagingSenderId: "430274132305",
  appId: "1:430274132305:web:3cdadf32d6b186843b3b70",
  measurementId: "G-D6DSZFWTP9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

async function createUser() {
  const email = 'admin@example.com';
  const password = 'password123';

  try {
    // Step 1: Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Successfully created user in Firebase Auth:', user.uid);

    // Step 2: Create a corresponding document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      companyId: "rak-safety-admin",
      companyName: "RAK Safety",
      isAdmin: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: "Admin",
      lastName: "User"
    });
    console.log('Successfully created user document in Firestore.');

  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
