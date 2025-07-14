
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';

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

async function createAdminUser() {
  const email = 'rukoen@gmail.com';
  const password = '50700Koen*'; // Use the password from users.json

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      companyId: "rak-safety-admin",
      companyName: "RAK Safety",
      isAdmin: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: "Rukoen",
      lastName: "Admin"
    });
    console.log('Successfully created admin user document.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
