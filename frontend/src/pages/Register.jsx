import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await signUp(name, email, password);
      console.log("Sign up successful, redirecting...");
      navigate("/mylist");
    } catch (err) {
      console.error("Sign up failed:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.message?.includes("Email already in use")) {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      await logInWithGoogle();
      console.log("Google sign up/login successful, redirecting...");
      navigate("/mylist");
    } catch (err) {
      console.error("Google sign up failed:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign up cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else {
        setError(err.message || "Failed to sign up with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] pt-40 mb-10">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-heading text-center mb-6">Sign Up</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-accent text-white font-bold py-3 rounded-xl hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-glass-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-secondary-text">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="/Google.svg" className="h-8 w-8" alt="Google icon" />
          {loading ? "Signing up..." : "Sign up with Google"}
        </button>

        <p className="text-center text-secondary-text mt-6">
          Already have an account?
          <Link to="/login" className="text-primary-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
