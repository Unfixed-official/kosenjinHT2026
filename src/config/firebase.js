import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAX1t7qs2DKaGyPgknR-UEVMFAiaOkSTW0",
    authDomain: "quintet-project-fa7a7.firebaseapp.com",
    projectId: "quintet-project-fa7a7",
    storageBucket: "quintet-project-fa7a7.firebasestorage.app",
    messagingSenderId: "916695863004",
    appId: "1:916695863004:web:e285482fcc76f09096ae19",
    measurementId: "G-BZKXH8ZJEP"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signInWithCredential };
