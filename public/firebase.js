import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7IIpgfevDfFxNHUyYisL14nfIIw9yV64",
  authDomain: "rak-safety-hub-n0boo.firebaseapp.com",
  projectId: "rak-safety-hub-n0boo",
  storageBucket: "rak-safety-hub-n0boo.appspot.com",
  messagingSenderId: "430274132305",
  appId: "1:430274132305:web:3cdadf32d6b186843b3b70",
  measurementId: "G-D6DSZFWTP9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
