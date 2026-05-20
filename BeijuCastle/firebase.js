// Importações do Firebase (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Config do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyBoWj12dKIgemwb303rbLshlTgB_V8C7eI",
  authDomain: "labelledecastle.firebaseapp.com",
  databaseURL: "https://labelledecastle-default-rtdb.firebaseio.com",
  projectId: "labelledecastle",
  storageBucket: "labelledecastle.firebasestorage.app",
  messagingSenderId: "1075907071780",
  appId: "1:1075907071780:web:d5fd6e8ce6b5630e0a6db1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();