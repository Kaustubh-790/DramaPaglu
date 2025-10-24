import { motion } from "framer-motion";
import { Heart, Eye, Check, Trash2 } from "lucide-react";

export default function DramaCard({
  drama,
  onToggleFavorite,
  onToggleStatus,
  onDelete,
}) {
  const getStatusBadge = () => {
    if (drama.status === "completed") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-secondary-accent/90 text-foreground">
          Completed
        </div>
      );
    }
    if (drama.status === "watching") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-tertiary-accent/90 text-background">
          Watching
        </div>
      );
    }
    if (drama.status === "planned") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-primary-accent/90 text-white">
          Planned
        </div>
      );
    }
    return null;
  };

  const getNextStatus = () => {
    if (drama.status === "planned") return "watching";
    if (drama.status === "watching") return "completed";
    return "planned";
  };

  const getStatusIcon = () => {
    if (drama.status === "watching") {
      return <Check className="w-5 h-5 text-tertiary-accent" />;
    }
    return <Eye className="w-5 h-5 text-foreground" />;
  };

  const getStatusTooltip = () => {
    if (drama.status === "planned") return "Mark as Watching";
    if (drama.status === "watching") return "Mark as Completed";
    return "Mark as Planned";
  };

  return (
    <motion.div className="glass rounded-2xl w-full h-auto aspect-[2/3] shrink-0 relative overflow-hidden group">
      <img
        src={drama.poster}
        alt={drama.title}
        className="w-full h-full object-cover absolute inset-0 z-0"
      />

      {getStatusBadge()}

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleStatus}
          className="glass glass-hover w-9 h-9 rounded-full flex items-center justify-center"
          title={getStatusTooltip()}
        >
          {getStatusIcon()}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="glass glass-hover w-9 h-9 rounded-full flex items-center justify-center"
          title="Delete"
        >
          <Trash2 className="w-5 h-5 text-primary-accent" />
        </motion.button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 via-background/60 to-transparent z-10">
        <div className="flex justify-between items-end gap-2">
          <div>
            <h4 className="text-base font-heading text-foreground line-clamp-2">
              {drama.title}
            </h4>
            <p className="text-xs text-secondary-text">
              {drama.year} • {drama.genres?.[0] || "Drama"}
            </p>
          </div>
          <Heart
            onClick={onToggleFavorite}
            className={`w-5 h-5 shrink-0 ml-1 transition-all cursor-pointer ${
              drama.favorite
                ? "text-primary-accent fill-primary-accent"
                : "text-foreground hover:text-primary-accent/70"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}
