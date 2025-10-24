import { motion, AnimatePresence } from "framer-motion";

const backgroundVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } },
};

const imageVariants = {
  initial: { scale: 1.1, opacity: 0.8 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 20,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

export default function BackgroundImage({ imageUrl }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={imageUrl}
          className="absolute inset-0"
          variants={backgroundVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.img
            src={imageUrl}
            alt="Background"
            className="w-full h-full object-cover"
            variants={imageVariants}
          />

          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/70 to-transparent"></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
