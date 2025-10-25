import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundImage from "../components/BackgroundManager";
import { useTheme } from "../context/ThemeContext";

const backgroundMap = {
  "/": { light: "/hero.png", dark: "/hero(dark).png" },
  "/mylist": { light: "/myList.png", dark: "/myList(dark).png" },
  "/favorites": { light: "/fav.png", dark: "/fav(dark).png" },
  "/login": { light: "/login-signup.png", dark: "/login-signup.png" },
  "/register": { light: "/login-signup.png", dark: "/login-signup.png" },
  "/search-results": { light: "/myList.png", dark: "/myList(dark).png" },
  "/profile": { light: "/profile.png", dark: "/profile(dark).png" },
};

const defaultBackground = { light: "/hero.png", dark: "/hero(dark).png" };

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
};

const Layout = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const backgroundSet = backgroundMap[location.pathname] || defaultBackground;

  const currentBackgroundUrl = backgroundSet[theme];

  return (
    <div className="flex flex-col min-h-screen relative text-foreground bg-background">
      <BackgroundImage imageUrl={currentBackgroundUrl} />

      <Navbar />

      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-auto relative z-10">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
