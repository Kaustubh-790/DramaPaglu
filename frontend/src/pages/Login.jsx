import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { logIn, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await logIn(email, password);
      console.log("Login successful, redirecting...");
      navigate("/mylist");
    } catch (err) {
      console.error("Login failed:", err);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await logInWithGoogle();
      console.log("Google login successful, redirecting...");
      navigate("/mylist");
    } catch (err) {
      console.error("Google login failed:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign in cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] pt-40 mb-10">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-heading text-center mb-6">Login</h2>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
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
            {loading ? "Logging in..." : "Login"}
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
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="/Google.svg" className="h-8 w-8" alt="Google icon" />
          {loading ? "Signing in..." : "Login with Google"}
        </button>

        <p className="text-center text-secondary-text mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
