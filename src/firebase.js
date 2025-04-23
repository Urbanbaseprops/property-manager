// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBC6glVjtMYQ4MgW03r6TieP7_nitEoxFs",
  authDomain: "property-manager-dcb26.firebaseapp.com",
  projectId: "property-manager-dcb26",
  storageBucket: "property-manager-dcb26.firebasestorage.app",
  messagingSenderId: "285321219737",
  appId: "1:285321219737:web:96d09f75188d2111957208",
  measurementId: "G-KTER3C85HE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
