import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function AccordionCard({ drama }) {
  const [open, setOpen] = useState(false);
  const [fav, setFav] = useState(drama.favorite);

  return (
    <motion.div
      layout
      className="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg border border-neutral-800"
    >
      <motion.div
        layout
        className="cursor-pointer relative"
        onClick={() => setOpen(!open)}
      >
        <img
          src={drama.poster}
          alt={drama.title}
          className="w-full h-80 object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
          <h3 className="text-lg font-semibold">{drama.title}</h3>
          <p className="text-sm text-neutral-400">{drama.status}</p>
        </div>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setFav(!fav);
          }}
          whileTap={{ scale: 0.8 }}
          className="absolute top-3 right-3"
        >
          <Heart
            className={`w-6 h-6 ${
              fav ? "text-accent-pink fill-accent-pink" : "text-neutral-400"
            }`}
          />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 space-y-3"
          >
            <div className="flex flex-wrap gap-2">
              {drama.genres.map((g) => (
                <span
                  key={g}
                  className="bg-accent-pink/20 text-accent-pink text-xs px-3 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-sm text-neutral-300">{drama.synopsis}</p>
            <button className="bg-accent-pink px-4 py-1 rounded-md text-sm hover:bg-accent-pink/80 transition">
              Mark as Completed
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
