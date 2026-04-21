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
 * This ensures all essential fields (id, email, name, photoURL) are always present.
 * Prevents Google Auth from overwriting custom display names.
 */
async function syncUserProfile(db: Firestore, user: User) {
  if (!db || !user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // Prepare standard profile data
  const profileData: any = {
    id: user.uid,
    email: user.email,
    updatedAt: serverTimestamp(),
  };

  // Only set/update displayName and photoURL if they don't exist in Firestore
  // This preserves custom names edited by the user in Settings
  if (!userSnap.exists() || !userSnap.data().displayName) {
    profileData.displayName = user.displayName || user.email?.split('@')[0] || 'Merchant';
  }

  // Always sync photoURL if available from Auth and not manually overridden (or just keep it synced)
  if (user.photoURL) {
    profileData.photoURL = user.photoURL;
  } else if (!userSnap.exists()) {
    profileData.photoURL = '';
  }

  // Only set createdAt if the document doesn't exist yet
  if (!userSnap.exists()) {
    profileData.createdAt = serverTimestamp();
  }

  // Save to Firestore with merge
  await setDoc(userRef, profileData, { merge: true });
}

/** Initiate email/password sign-up with custom verification. */
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
    // Sync to Firestore immediately after creation
    await syncUserProfile(db, userCredential.user);
    
    // Custom email verification link
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/auth/verify-email`,
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
    // Sync profile on every login to ensure data integrity
    await syncUserProfile(db, userCredential.user);
  }
  return userCredential;
}

/** Initiate Google sign-in. */
export async function initiateGoogleSignIn(authInstance: Auth, db: Firestore): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(authInstance, provider);
  if (userCredential.user) {
    // Sync profile for Google users
    await syncUserProfile(db, userCredential.user);
  }
  return userCredential;
}

/** Send customized password reset email pointing to our custom page. */
export async function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  // Ensure this matches the page path
  const actionCodeSettings: ActionCodeSettings = {
    url: `${window.location.origin}/auth/reset-password`,
    handleCodeInApp: true,
  };
  await sendPasswordResetEmail(authInstance, email, actionCodeSettings);
}

/** 
 * Update user profile. 
 * Ensures basic fields are not lost during update.
 */
export async function updateUserProfile(
  db: Firestore,
  user: User, 
  data: { displayName?: string; photoURL?: string }
): Promise<void> {
  // Update Auth Profile
  await updateProfile(user, data);
  
  // Update Firestore Document
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    ...data,
    id: user.uid,
    email: user.email,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
