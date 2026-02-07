// lib/auth.ts - WERSJA BEZ FIRESTORE
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// ✅ REJESTRACJA - tylko Authentication, bez Firestore
export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// ✅ LOGOWANIE - tylko Authentication
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// ✅ LOGOWANIE GOOGLE - tylko Authentication
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// ✅ WYLOGOWANIE
export const logout = async () => {
  await signOut(auth);
};

// ✅ RESET HASŁA
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// ✅ ZMIANA HASŁA
export const updateUserPassword = async (newPassword: string) => {
  if (auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      throw new Error(getErrorMessage(error.code));
    }
  }
};

// ✅ AKTUALIZACJA PROFILU (tylko displayName w Authentication)
export const updateUserProfile = async (displayName: string) => {
  if (!auth.currentUser) throw new Error('Nie jesteś zalogowany');
  
  try {
    await updateProfile(auth.currentUser, { displayName });
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// ✅ POBRANIE DANYCH UŻYTKOWNIKA (z Authentication)
export const getUserProfile = () => {
  if (!auth.currentUser) return null;
  
  return {
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    displayName: auth.currentUser.displayName,
    photoURL: auth.currentUser.photoURL
  };
};


// Helper function dla lepszych komunikatów błędów
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Ten adres email jest już używany';
    case 'auth/invalid-email':
      return 'Nieprawidłowy adres email';
    case 'auth/operation-not-allowed':
      return 'Operacja niedozwolona';
    case 'auth/weak-password':
      return 'Hasło jest za słabe (minimum 6 znaków)';
    case 'auth/user-disabled':
      return 'To konto zostało zablokowane';
    case 'auth/user-not-found':
      return 'Nie znaleziono użytkownika';
    case 'auth/wrong-password':
      return 'Nieprawidłowe hasło';
    case 'auth/invalid-credential':
      return 'Nieprawidłowe dane logowania';
    case 'auth/popup-closed-by-user':
      return 'Logowanie zostało anulowane';
    default:
      return 'Wystąpił błąd: ' + errorCode;
  }
}

// ✅ Pobranie roli użytkownika (z Custom Claims)
export const getUserRole = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const token = await user.getIdTokenResult(true);
  return token.claims.admin ? "admin" : "user";
};
