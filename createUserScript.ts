
// This is a temporary script to create a user in Firebase Authentication.
// We will delete this file after the user is created.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

async function createAdminUserDocument() {
  const email = 'rukoen@gmail.com';
  const password = '50700Koen*'; // Use the password from users.json

  try {
    // Step 1: Sign in to get the user's UID. We assume the user already exists in Auth.
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Successfully signed in user to get UID:', user.uid);

    // Step 2: Create the corresponding document in Firestore with admin privileges.
    // This will overwrite any existing document for this UID.
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      companyId: "rak-safety-admin",
      companyName: "RAK Safety",
      isAdmin: true, // Assign admin role
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: "Rukoen", // Example name
      lastName: "Admin"
    });
    console.log('Successfully created/updated user document in Firestore with admin privileges.');

  } catch (error) {
    console.error('Error creating admin user document:', error);
  }
}

createAdminUserDocument();
