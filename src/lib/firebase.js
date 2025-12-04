// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; // <--- 1. ต้องเพิ่มบรรทัดนี้ครับ

// --- สำคัญ! เอา Config จาก Firebase Console มาแทนที่ตรงนี้ ---
const firebaseConfig = {
  apiKey: "AIzaSyD_8auYKSb3tiqfmSCscHjURmr6nq9Yosk",
  authDomain: "restaurant-pos-d298f.firebaseapp.com",
  projectId: "restaurant-pos-d298f",
  storageBucket: "restaurant-pos-d298f.firebasestorage.app",
  messagingSenderId: "576107465730",
  appId: "1:576107465730:web:5dd6b61431f6894bd2ab1b",
  measurementId: "G-4RVYXC4XQ3"
};
// -------------------------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);