import { motion } from "framer-motion";
import { ListTodo, Eye, Check } from "lucide-react";

// New StatusBadge component using lucide-react icons
const StatusBadge = ({ status }) => {
  const getStyle = (s) => {
    switch (s) {
      case "completed":
        // Green Check icon for 'Completed'
        return {
          icon: <Check className="w-5 h-5" />,
          className: "bg-green-600/50 text-white",
        };
      case "watching":
        // Blue Eye icon for 'Watching'
        return {
          icon: <Eye className="w-5 h-5" />,
          className: "bg-blue-600/50 text-white",
        };
      case "planned":
        // Gray ListTodo icon for 'Planned'
        return {
          icon: <ListTodo className="w-5 h-5" />,
          className: "bg-gray-600/50 text-white",
        };
      default:
        return null;
    }
  };

  const badgeInfo = getStyle(status);

  if (!badgeInfo) return null;

  return (
    <div
      className={`absolute top-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-sm ${badgeInfo.className} flex items-center justify-center`}
      // Applying a fixed size and the glass effect directly
      style={{
        width: "36px",
        height: "36px",
        background: `var(--glass-surface)` /* Using CSS variable for glass base */,
        borderColor: `var(--glass-border)` /* Using CSS variable for border */,
      }}
    >
      {badgeInfo.icon}
    </div>
  );
};

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

      {drama.status && <StatusBadge status={drama.status} />}

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
