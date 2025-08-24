// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase config (keep this safe)
const firebaseConfig = {
  apiKey: "AIzaSyAg6O4z7Y4o0Hwhg2vyPKO9jzBo1hA4aJc",
  authDomain: "medisyncx25.firebaseapp.com",
  databaseURL: "https://medisyncx25-default-rtdb.firebaseio.com",
  projectId: "medisyncx25",
  storageBucket: "medisyncx25.appspot.com",
  messagingSenderId: "1016561758961",
  appId: "1:1016561758961:web:551433f8f0d1e19b65af50",
  measurementId: "G-6VNVSWM2H1"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export services so you can use them anywhere
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
