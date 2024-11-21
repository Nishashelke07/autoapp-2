// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDodc4HzTkOC5gAwHKLcPmxVV61QwTDEsk",
  authDomain: "autoapp-e858e.firebaseapp.com",
  projectId: "autoapp-e858e",
  storageBucket: "autoapp-e858e.appspot.com",
  messagingSenderId: "963448591180",
  appId: "1:963448591180:web:6e98e26d8752354d1635e9",
  databaseURL: "https://autoapp-e858e-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getDatabase(app);

export { app, auth, db };