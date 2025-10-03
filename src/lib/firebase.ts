
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv8Nl2Q1m4w-Dzh8R7Gnyng1nEdXgMNqg",
  authDomain: "studio-6286417362-ef95c.firebaseapp.com",
  projectId: "studio-6286417362-ef95c",
  storageBucket: "studio-6286417362-ef95c.appspot.com",
  messagingSenderId: "116357963805",
  appId: "1:116357963805:web:dbe9e9c4da7e51c25626f4",
  measurementId: ""
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- App Check ---
const appCheckKey = "6LdRYN0rAAAAAKsJbamQolPsvSR76jYFI8FU2eaJ";

if (typeof window !== "undefined") {
  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error("Failed to initialize App Check", error);
  }
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
