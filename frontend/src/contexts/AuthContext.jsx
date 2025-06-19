import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  onIdTokenChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

import { firebaseConfig } from "../firebase/firebaseConfig";



const FirebaseApp = initializeApp(firebaseConfig);
const Auth = getAuth(FirebaseApp);


setPersistence(Auth, inMemoryPersistence).catch(console.error);

const DB = getFirestore(FirebaseApp);


// React context

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(Auth, async (u) => {
      if (u) {
        setUser(u);
        
        const idTokenResult = await u.getIdTokenResult(true);
        setRole(idTokenResult.claims.role || "user");

        const freshToken = await u.getIdToken(true); 
        setToken(freshToken);
      } else {
        setUser(null);
        setRole(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

 
  // Auth helpers
  

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(Auth, provider);
    const freshToken = await result.user.getIdToken(true);
    setToken(freshToken);
  };

  const logout = async () => {
    await signOut(Auth);
  
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const value = {
    user,
    role,
    token,
    loading,
    login,
    logout,
    db: DB, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
