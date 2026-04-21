
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
import { notifyWelcome } from '@/app/actions/notifications';

/**
 * Creates or updates a user profile in Firestore.
 */
async function syncUserProfile(db: Firestore, user: User) {
  if (!db || !user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const profileData: any = {
    id: user.uid,
    email: user.email,
    updatedAt: serverTimestamp(),
  };

  if (!userSnap.exists() || !userSnap.data().displayName) {
    profileData.displayName = user.displayName || user.email?.split('@')[0] || 'Merchant';
  }

  if (user.photoURL) {
    profileData.photoURL = user.photoURL;
  } else if (!userSnap.exists()) {
    profileData.photoURL = '';
  }

  if (!userSnap.exists()) {
    profileData.createdAt = serverTimestamp();
  }

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
    
    await syncUserProfile(db, userCredential.user);
    
    // 1. Send our custom SMTP Welcome email
    notifyWelcome(email, name || 'Merchant').catch(e => console.error("Welcome email failed:", e));

    // 2. Firebase verification link (internal)
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
    // If new user, send welcome
    // (Note: in production you'd check if it's the first time)
  }
  return userCredential;
}

/** Send customized password reset email pointing to our custom page. */
export async function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: `${window.location.origin}/auth/reset-password`,
    handleCodeInApp: true,
  };
  await sendPasswordResetEmail(authInstance, email, actionCodeSettings);
}

/** 
 * Update user profile. 
 */
export async function updateUserProfile(
  db: Firestore,
  user: User, 
  data: { displayName?: string; photoURL?: string }
): Promise<void> {
  await updateProfile(user, data);
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    ...data,
    id: user.uid,
    email: user.email,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
