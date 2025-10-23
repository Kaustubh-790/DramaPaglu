import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="text-center mt-10 space-y-10">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-5xl font-bold"
      >
        Track. Discover. <span className="text-accent-pink">Love</span> again.
      </motion.h1>

      <motion.img
        src="https://images.unsplash.com/photo-1575936123452-b67c3203c357"
        alt="hero"
        className="mx-auto rounded-2xl shadow-2xl w-full md:w-2/3 object-cover"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      />
    </div>
  );
}
