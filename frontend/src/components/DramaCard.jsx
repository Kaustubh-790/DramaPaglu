import { motion } from "framer-motion";

export default function DramaCard({ drama }) {
  return (
    <motion.div
      className="glass rounded-2xl w-full h-auto aspect-[2/3] shrink-0 relative overflow-hidden group"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img
        src={drama.poster}
        alt={drama.title}
        className="w-full h-full object-cover absolute inset-0 z-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://via.placeholder.com/500x750.png?text=No+Image";
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent z-[5]"></div>

      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <div className="flex justify-between items-end gap-2">
          <div>
            <h4 className="text-base font-heading text-white line-clamp-2">
              {drama.title}
            </h4>
            <p className="text-xs text-gray-300">
              {drama.year}{" "}
              {drama.genres && drama.genres.length > 0
                ? `• ${drama.genres[0]}`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
