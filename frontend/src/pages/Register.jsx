import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signUp, logInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signUp(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await logInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] pt-40 mb-10">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-heading text-center mb-6">Sign Up</h2>
        {error && (
          <p className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl focus:outline-none focus:border-primary-accent/50"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary-accent text-white font-bold py-3 rounded-xl hover:bg-opacity-80 transition-all"
          >
            Create Account
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
          className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <img src="/Google.svg" className="h-8 w-8" /> Sign up with Google
        </button>
        <p className="text-center text-secondary-text mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
