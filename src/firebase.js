// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Добавете този ред
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUyOu_j-kYe1oyZCGL6ixt5qqY4mfWZgk",
  authDomain: "api-project-474512808850.firebaseapp.com",
  projectId: "api-project-474512808850",
  storageBucket: "api-project-474512808850.appspot.com",
  messagingSenderId: "474512808850",
  appId: "1:474512808850:web:078dcb013014cd01dcbf4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a references to the service
export const auth = getAuth(app);

// Добавете този код за инициализация на Firestore
export const db = getFirestore(app);