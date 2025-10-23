import { Link, useLocation } from "react-router-dom";
import { Heart, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const { pathname } = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/mylist", label: "My List" },
    { to: "/discover", label: "Discover" },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center">
      <div className="glass flex items-center justify-between w-full max-w-6xl mx-auto rounded-2xl px-8 py-4 shadow-lg">
        <div className="flex-shrink-0 flex justify-start">
          <Link
            to="/"
            className="text-2xl font-heading font-bold text-primary-accent whitespace-nowrap"
          >
            <Heart className="inline w-6 h-6 mr-1 -mt-1" />
            Drama Paglu
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

          <Heart className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
          <User className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}
