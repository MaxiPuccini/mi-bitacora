import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);  // Firebase user
  const [profile, setProfile] = useState(null);  // Firestore profile (con rol)
  const [loading, setLoading] = useState(true);

  // Escucha cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Lee el perfil de Firestore (incluye el campo `role`)
  async function fetchProfile(uid) {
    const ref  = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setProfile(snap.data());
  }

  // ── Registro ───────────────────────────────────────────
  async function register(email, password, displayName) {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName });

    const profileData = {
      uid:         newUser.uid,
      email,
      displayName,
      role:        'user',       // por defecto usuario normal
      createdAt:   serverTimestamp(),
      tripsCount:  0,
      avatarUrl:   null,
    };

    await setDoc(doc(db, 'users', newUser.uid), profileData);
    setProfile(profileData);
    return newUser;
  }

  // ── Login ──────────────────────────────────────────────
  async function login(email, password) {
    const { user: loggedUser } = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(loggedUser.uid);
    return loggedUser;
  }

  // ── Logout ─────────────────────────────────────────────
  async function logout() {
    await signOut(auth);
  }

  // ── Helpers de rol ─────────────────────────────────────
  const isAdmin = profile?.role === 'admin';
  const isUser  = profile?.role === 'user';
  const role    = profile?.role ?? null;

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isUser,
    role,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
