'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  UserCredential,
  ActionCodeSettings
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Firestore } from 'firebase/firestore';

/**
 * Creates or updates a user profile in Firestore.
 * This ensures data is always synced to the 'users' collection.
 */
async function syncUserProfile(db: Firestore, user: User) {
  if (!db || !user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // Update or create document
  await setDoc(userRef, {
    id: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0],
    photoURL: user.photoURL || '',
    updatedAt: serverTimestamp(),
    // Only set createdAt if it doesn't exist
    ...(!userSnap.exists() ? { createdAt: serverTimestamp() } : {})
  }, { merge: true });
}

/** Initiate email/password sign-up. */
export async function initiateEmailSignUp(
  authInstance: Auth, 
  db: Firestore,
  email: string, 
  password: string, 
  name?: string
): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  if (userCredential.user) {
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    // Critical: Sync to Firestore
    await syncUserProfile(db, userCredential.user);
    
    // Send customized verification email
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };
    await sendEmailVerification(userCredential.user, actionCodeSettings);
  }
  return userCredential;
}

/** Initiate email/password sign-in. */
export async function initiateEmailSignIn(
  authInstance: Auth, 
  db: Firestore,
  email: string, 
  password: string
): Promise<UserCredential> {
  const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
  if (userCredential.user) {
    await syncUserProfile(db, userCredential.user);
  }
  return userCredential;
}

/** Initiate Google sign-in. */
export async function initiateGoogleSignIn(authInstance: Auth, db: Firestore): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(authInstance, provider);
  if (userCredential.user) {
    await syncUserProfile(db, userCredential.user);
  }
  return userCredential;
}

/** Send customized password reset email. */
export function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: `${window.location.origin}/auth/reset-password`,
    handleCodeInApp: true,
  };
  return sendPasswordResetEmail(authInstance, email, actionCodeSettings);
}

/** Update user profile. */
export async function updateUserProfile(
  db: Firestore,
  user: User, 
  data: { displayName?: string; photoURL?: string }
): Promise<void> {
  await updateProfile(user, data);
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
