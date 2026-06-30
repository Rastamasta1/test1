// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Initialize Firebase app with your configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to sign in a user
export const signInUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in successfully');
  } catch (error) {
    console.error('Sign-in error:', error.message);
  }
};

// Function to create a new user
export const createUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully');
  } catch (error) {
    console.error('Create user error:', error.message);
  }
};

// Function to sign out a user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign-out error:', error.message);
  }
};