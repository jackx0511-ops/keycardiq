
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "https://xbet-86a1f-default-rtdb.firebaseio.com",
  projectId: "xbet-86a1f",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// كلمة مرور صفحة الإدارة (غيّرها لكلمة مرور قوية)
const ADMIN_PASSWORD = "qi_admin_2026";

// ============================================
// تهيئة Firebase
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, ADMIN_PASSWORD };