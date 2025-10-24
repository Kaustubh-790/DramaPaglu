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
    if (!config.headers.Authorization) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
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

  const syncUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setDbUser(null);
      return null;
    }
    try {
      console.log("Attempting to fetch DB profile...");
      const { data } = await api.get("/users/profile");
      setDbUser(data);
      console.log("DB profile fetched:", data);
      return data;
    } catch (error) {
      console.error(
        "Fetch DB profile error:",
        error.response?.data || error.message
      );
      // If user not found in DB (404), try to create/update them via /google endpoint
      if (error.response && error.response.status === 404) {
        console.log(
          "User not found in DB, attempting sync via /users/google..."
        );
        try {
          // Ensure the token is attached by the interceptor for this call
          // It relies on onAuthStateChanged having set currentUser before this runs,
          // or signInWithPopup having completed.
          const { data } = await api.post("/users/google"); // Backend upserts user
          setDbUser(data);
          console.log("DB profile synced/created via /users/google:", data);
          return data;
        } catch (syncError) {
          console.error(
            "Failed to sync/create user profile in DB via /users/google",
            syncError.response?.data || syncError.message
          );
          // Log out the user if DB sync fails catastrophically? Or handle differently?
          // signOut(auth); // Optional: Force logout if DB sync fails
          setDbUser(null); // Ensure dbUser is null if sync failed
          return null;
        }
      }
      setDbUser(null); // Ensure dbUser is null if fetch failed for other reasons
      return null;
    }
  }, []); // useCallback dependency array is empty as it uses auth.currentUser internally via interceptor

  // --- Sign Up (Email) --- - Keep previous fix
  const signUp = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();
    const { data } = await api.post(
      "/users/register",
      { name, email },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setDbUser(data);
    return userCredential; // currentUser state will update via onAuthStateChanged
  };

  // --- Sign In (Email) ---
  const logIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // After Firebase login, sync/fetch the profile from our DB
    return await syncUserProfile(userCredential.user);
  };

  // --- Sign In/Up (Google) ---
  const logInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // After Firebase popup succeeds, call syncUserProfile which handles backend upsert via /users/google
    // The onAuthStateChanged listener might fire slightly before or after this,
    // syncUserProfile handles potentially fetching or creating the user.
    return await syncUserProfile(result.user);
  };

  const logOut = () => {
    return signOut(auth);
  };

  // --- Auth State Listener ---
  useEffect(() => {
    console.log("Setting up onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "onAuthStateChanged triggered. User:",
        user ? user.uid : "null"
      );
      setCurrentUser(user); // Set Firebase user state
      if (user) {
        // User logged in (Firebase knows about them)
        // Attempt to fetch/sync their profile from our DB
        await syncUserProfile(user);
      } else {
        // User logged out
        setDbUser(null); // Clear DB user
      }
      setLoading(false); // Mark loading as complete
    });

    // Cleanup listener on component unmount
    return () => {
      console.log("Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
  }, [syncUserProfile]); // Add syncUserProfile as a dependency

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
