import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { data } = await api.post("/users/register", { name, email });
    setDbUser(data);
    return userCredential;
  };

  const logIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { data } = await api.post("/users/google");
    setDbUser(data);
    return result;
  };

  const logOut = () => {
    return signOut(auth);
  };

  const fetchDbProfile = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const { data } = await api.get("/users/profile");
        setDbUser(data);
      } catch (error) {
        console.error("Failed to fetch user profile from DB", error);
        if (error.response && error.response.status === 404) {
          console.log("User not in DB, attempting to register...");
          try {
            const { data } = await api.post("/users/google");
            setDbUser(data);
          } catch (registerError) {
            console.error("Auto-registration failed", registerError);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchDbProfile();
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchDbProfile]);

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
