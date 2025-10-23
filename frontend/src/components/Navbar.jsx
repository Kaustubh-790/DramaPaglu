import { Link, useLocation } from "react-router-dom";
import { Heart, Search, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/mylist", label: "My List" },
    { to: "/discover", label: "Discover" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-xl font-bold text-accent-pink">
          DramaLog
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="relative">
              {pathname === l.to && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent-pink"
                />
              )}
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5" />
          <Heart className="w-5 h-5" />
          <User className="w-5 h-5" />
        </div>
      </div>
    </nav>
  );
}
