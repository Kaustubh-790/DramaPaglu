import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin } from "lucide-react";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
  },
};

const linkHover = {
  scale: 1.1,
  color: "var(--primary-accent)",
};

const iconHover = {
  scale: 1.2,
  rotate: 5,
};

function Footer() {
  const currentYear = new Date().getFullYear();

  const sectionLinks = [
    { to: "/", label: "Home" },
    { to: "/mylist", label: "My List" },
    { to: "/favorites", label: "Favorites" },
  ];

  const socialLinks = [
    {
      href: "https://github.com/Kaustubh-790",
      icon: <Github className="w-5 h-5" />,
      label: "GitHub",
    },
    {
      href: "https://www.instagram.com/Kaustubh_790/",
      icon: <Instagram className="w-5 h-5" />,
      label: "Instagram",
    },
    {
      href: "https://www.linkedin.com/in/kaustubh-sharma-0b25a4322/",
      icon: <Linkedin className="w-5 h-5" />,
      label: "LinkedIn",
    },
  ];

  return (
    <motion.footer
      className="w-full mt-auto py-8 px-4 border-t border-glass-border bg-background/50 backdrop-blur-[4px]"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <Link
            to="/"
            className="text-xl font-heading font-bold text-primary-accent mb-2 block"
          >
            Drama Paglu
          </Link>
          <p className="text-xs text-secondary-text">
            &copy; {currentYear} Drama Paglu. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {sectionLinks.map((link) => (
            <motion.div key={link.to} whileHover={linkHover}>
              <Link
                to={link.to}
                className="text-sm text-secondary-text hover:text-primary-accent transition-colors"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="text-center md:text-right">
          <p className="text-xs text-secondary-text mb-2">
            Made with ♡ by{" "}
            <a
              href="https://github.com/Kaustubh-790"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary-accent transition-colors"
            >
              Kaustubh Sharma
            </a>
          </p>
          <div className="flex justify-center md:justify-end gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-text hover:text-primary-accent transition-colors"
                aria-label={social.label}
                whileHover={iconHover}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
