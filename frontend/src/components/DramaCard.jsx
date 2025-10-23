import { motion } from "framer-motion";
import { Heart, Eye, Check, Trash2 } from "lucide-react";

// This new component is modeled after your TiltableGlassCard for visual consistency
export default function DramaCard({
  drama,
  onToggleFavorite,
  onToggleStatus,
  onDelete,
}) {
  const getStatusBadge = () => {
    if (drama.status === "Completed") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-secondary-accent/90 text-foreground">
          {drama.status}
        </div>
      );
    }
    if (drama.status === "Watching") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-tertiary-accent/90 text-background">
          {drama.status}
        </div>
      );
    }
    // "Want to Watch" or other statuses won't show a badge
    return null;
  };

  return (
    <motion.div className="glass rounded-2xl w-full h-auto aspect-[2/3] shrink-0 relative overflow-hidden group">
      {/* Poster Image */}
      <img
        src={drama.poster}
        alt={drama.title}
        className="w-full h-full object-cover absolute inset-0 z-0"
      />

      {/* Status Badge */}
      {getStatusBadge()}

      {/* Quick Actions - Appear on Hover */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleStatus}
          className="glass glass-hover w-9 h-9 rounded-full flex items-center justify-center"
          title={
            drama.status === "Watching"
              ? "Mark as Completed"
              : "Mark as Watching"
          }
        >
          {drama.status === "Watching" ? (
            <Check className="w-5 h-5 text-tertiary-accent" />
          ) : (
            <Eye className="w-5 h-5 text-foreground" />
          )}
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
              {drama.year} • {drama.genres[0]}
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
