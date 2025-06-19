import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig ={
  apiKey: "AIzaSyCsa3MlAM9sjlLaF0ocC-_uM9340bmxRmA",
  authDomain: "user-pattern-analyzer.firebaseapp.com",
  projectId: "user-pattern-analyzer",
  storageBucket: "user-pattern-analyzer.firebasestorage.app",
  messagingSenderId: "579086867405",
  appId: "1:579086867405:web:8c143fa5c05ada4067c284",
  measurementId: "G-GYZMRJD9VS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);