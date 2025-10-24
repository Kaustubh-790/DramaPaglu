import { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "../firebase";
import api from "../api/apiClient";

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      const { data } = await api.post(
        "/users/register",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDbUser(data);
      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const logIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { data } = await api.get("/users/profile");
      setDbUser(data);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 404) {
        throw new Error(
          "Account not found in database. Please sign up first or contact support."
        );
      }
      throw error;
    }
  };

  const logInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const { data } = await api.post(
        "/users/google",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDbUser(data);
      return data;
    } catch (error) {
      console.error("Google sign in error:", error);
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Failed to sign out after error:", signOutError);
      }
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setDbUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get("/users/profile");
      setDbUser(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setDbUser(null);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile();
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    dbUser,
    loading,
    signUp,
    logIn,
    logInWithGoogle,
    logOut,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
