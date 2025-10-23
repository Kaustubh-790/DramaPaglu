import { Link, useLocation } from "react-router-dom";
import { Heart, Search, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/mylist", label: "My List" },
    { to: "/discover", label: "Discover" },
  ];

  return (
    <nav className="fixed top-6 left-0 w-full z-50 container-padding">
      <div className="glass flex items-center justify-between max-w-5xl mx-auto rounded-2xl px-8 py-4 shadow-lg">
        <Link
          to="/"
          className="text-2xl font-heading font-bold text-primary-accent"
        >
          DramaLog
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative text-secondary-text hover:text-foreground transition-colors py-1"
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

        <div className="flex items-center gap-5">
          <Search className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
          <Heart className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
          <User className="w-5 h-5 text-secondary-text hover:text-primary-accent transition-colors cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}
