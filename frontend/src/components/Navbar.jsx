import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Search, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { currentUser, dbUser, logOut } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/mylist", label: "My List" },
    { to: "/discover", label: "Discover" },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 rounded-full flex justify-center">
      <div className="glass flex items-center justify-between w-full max-w-6xl mx-auto rounded-4xl px-8 py-4 shadow-lg">
        <div className="flex-shrink-0 flex justify-start">
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-heading font-bold text-primary-accent whitespace-nowrap"
          >
            <span>Drama Paglu</span>
          </Link>
        </div>
        <div className="flex items-center gap-8 justify-center flex-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative text-secondary-text hover:text-foreground transition-colors py-1 whitespace-nowrap"
            >
              {pathname === l.to && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary-accent rounded-full"
                />
              )}
              <span className="font-medium text-base">{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-5 justify-end">
          <div className="flex items-center">
            <motion.input
              type="text"
              placeholder="Search..."
              initial={{ width: 0, opacity: 0, marginRight: 0 }}
              animate={{
                width: isSearchOpen ? 150 : 0,
                opacity: isSearchOpen ? 1 : 0,
                marginRight: isSearchOpen ? "0.75rem" : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="glass h-9 rounded-full text-sm text-foreground placeholder-secondary-text px-3 focus:outline-none focus:border-primary-accent/50"
            />
            <Search
              className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
          </div>

          {currentUser ? (
            <>
              <Link to="/mylist">
                <Heart className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
              </Link>
              <div className="flex items-center gap-2">
                {dbUser?.photoURL ? (
                  <img
                    src={dbUser.photoURL}
                    alt={dbUser.name}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-secondary-text" />
                )}
                <span className="text-sm font-medium hidden md:block">
                  {dbUser?.name?.split(" ")[0] || "Profile"}
                </span>
              </div>
              <LogOut
                className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer"
                onClick={handleLogout}
              />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-base font-medium text-secondary-text hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-base font-medium bg-primary-accent text-white px-4 py-1.5 rounded-full hover:bg-opacity-80 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
