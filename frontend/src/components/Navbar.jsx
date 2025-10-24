import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Search, User, LogOut, Sun, Moon, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, Fragment, useEffect, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // Import useTheme

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser, dbUser, logOut } = useAuth(); // Removed api, using from useAuth context
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/mylist", label: "My List" },
    { to: "/favorites", label: "Favourites" }, // Corrected spelling
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchIconClick = () => {
    if (isSearchOpen && searchQuery.trim()) {
      handleSearchSubmit(new Event("submit"));
    } else {
      setIsSearchOpen(!isSearchOpen);
    }
  };

  // Removed local toggleTheme, using the one from context

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      {/* Added dark mode class for glass effect based on theme */}
      <div className="glass flex items-center justify-between w-full max-w-6xl mx-auto rounded-full px-6 md:px-8 py-3 md:py-4 shadow-lg">
        <div className="flex-shrink-0 flex justify-start">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl md:text-2xl font-heading font-bold text-primary-accent whitespace-nowrap"
          >
            <span>Drama Paglu</span>
          </Link>
        </div>

        {/* Navbar links with dark mode text colors */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 justify-center flex-1">
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
              <span className="font-medium text-sm lg:text-base">
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right side icons and profile */}
        <div className="flex items-center gap-3 md:gap-5 justify-end">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <motion.input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              initial={{ width: 0, opacity: 0, marginRight: 0 }}
              animate={{
                width: isSearchOpen ? 120 : 0,
                opacity: isSearchOpen ? 1 : 0,
                marginRight: isSearchOpen ? "0.5rem" : 0,
                paddingLeft: isSearchOpen ? "0.75rem" : "0rem",
                paddingRight: isSearchOpen ? "0.75rem" : "0rem",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              // Added dark mode styles for input
              className="glass h-8 md:h-9 rounded-full text-xs md:text-sm text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-transparent"
            />
            <Search
              className="w-4 h-4 md:w-5 md:h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer"
              onClick={handleSearchIconClick}
            />
          </form>

          {currentUser && (
            <Link to="/favorites" className="hidden sm:block">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
            </Link>
          )}

          {currentUser ? (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center gap-2 cursor-pointer rounded-full p-1 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                  {dbUser?.photoURL ? (
                    <img
                      src={dbUser.photoURL}
                      alt={dbUser.name || "User"}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 md:w-6 md:h-6 text-secondary-text" />
                  )}
                  <span className="text-xs md:text-sm font-medium hidden lg:block text-foreground">
                    {dbUser?.name?.split(" ")[0] || "Profile"}
                  </span>
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {/* Added dark mode styles for dropdown */}
                <Menu.Items
                  as={motion.div}
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl glass shadow-lg focus:outline-none overflow-hidden border border-glass-border"
                >
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile" // Assuming a profile page route exists or will be created
                          className={`${
                            active ? "bg-white/10 dark:bg-white/5" : ""
                          } group flex w-full items-center px-4 py-2 text-sm text-foreground transition-colors`}
                        >
                          <Settings className="mr-2 h-4 w-4 text-secondary-text group-hover:text-foreground" />
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={toggleTheme} // Use toggleTheme from context
                          className={`${
                            active ? "bg-white/10 dark:bg-white/5" : ""
                          } group flex w-full items-center px-4 py-2 text-sm text-foreground transition-colors`}
                        >
                          {theme === "dark" ? (
                            <Sun className="mr-2 h-4 w-4 text-secondary-text group-hover:text-foreground" />
                          ) : (
                            <Moon className="mr-2 h-4 w-4 text-secondary-text group-hover:text-foreground" />
                          )}
                          {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? "bg-white/10 dark:bg-white/5" : ""
                          } group flex w-full items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors`}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <Link
              to="/login"
              className="text-sm md:text-base font-medium text-secondary-text hover:text-foreground whitespace-nowrap"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Nav - Added dark mode styles */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-glass-border py-2 px-4 flex justify-around items-center">
        {/* Simplified mobile nav - showing only Home, My List, Favourites if logged in */}
        <Link
          key="mobile-/"
          to="/"
          className={`flex flex-col items-center p-2 rounded-md ${
            pathname === "/"
              ? "text-primary-accent"
              : "text-secondary-text hover:text-foreground"
          }`}
        >
          {/* Using User icon for Home */}
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        {currentUser && (
          <>
            <Link
              key="mobile-/mylist"
              to="/mylist"
              className={`flex flex-col items-center p-2 rounded-md ${
                pathname === "/mylist"
                  ? "text-primary-accent"
                  : "text-secondary-text hover:text-foreground"
              }`}
            >
              {/* Using List icon for My List */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <span className="text-xs">My List</span>
            </Link>
            <Link
              key="mobile-/favorites"
              to="/favorites"
              className={`flex flex-col items-center p-2 rounded-md ${
                pathname === "/favorites"
                  ? "text-primary-accent"
                  : "text-secondary-text hover:text-foreground"
              }`}
            >
              <Heart
                className={`w-5 h-5 mb-1 ${
                  pathname === "/favorites" ? "fill-current" : ""
                }`}
              />
              <span className="text-xs">Favorites</span>
            </Link>
          </>
        )}
        {!currentUser && (
          <Link
            to="/login"
            className={`flex flex-col items-center p-2 rounded-md text-secondary-text hover:text-foreground`}
          >
            <LogOut className="w-5 h-5 mb-1 transform rotate-180" />
            <span className="text-xs">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
