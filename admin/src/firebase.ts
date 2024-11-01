// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRSVOllsNtD69rwUiBYBS0DY9geqxzTlA",
  authDomain: "elmensual-website.firebaseapp.com",
  projectId: "elmensual-website",
  storageBucket: "elmensual-website.firebasestorage.app",
  messagingSenderId: "301220142888",
  appId: "1:301220142888:web:f8bb89d5bbf92c7a113a1d",
  measurementId: "G-ZHBHQKTRF0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;
