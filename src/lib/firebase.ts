
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// --- IMPORTANT ---
// The environment variables were not loading correctly.
// Please replace the placeholder values below with your actual Firebase project credentials.
// You can find these in your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE",
};

// --- App Check ---
// Also replace this with your reCAPTCHA v3 site key from the Firebase console.
const appCheckKey = "YOUR_APP_CHECK_SITE_KEY_HERE";


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check
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
