import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, ListTodo, Eye, Check } from "lucide-react";
import { useEffect } from "react";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 15, stiffness: 200 },
  },
  exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } },
};

const buttonHoverTransition = { type: "spring", stiffness: 300, damping: 15 };
const buttonHoverEffect = { scale: 1.05, rotateX: -10, y: -3 };

export default function DramaDetailsModal({
  isOpen,
  onClose,
  drama,
  onToggleFavorite,
  onSetStatus,
  onDelete,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!drama) return null;
  const statuses = [
    {
      value: "planned",
      label: "Planned",
      icon: <ListTodo className="w-5 h-5" />,
    },
    { value: "watching", label: "Watching", icon: <Eye className="w-5 h-5" /> },
    {
      value: "completed",
      label: "Completed",
      icon: <Check className="w-5 h-5" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 cursor-pointer"
          />

          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drama-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="glass w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
              <div className="w-full md:w-1/3 flex-shrink-0 relative">
                <img
                  src={drama.poster}
                  alt={`Poster for ${drama.title}`}
                  className="w-full h-64 md:h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/500x750.png?text=No+Image";
                  }}
                />
              </div>

              <div
                className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto relative"
                style={{ perspective: 1000 }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2
                  id="drama-modal-title"
                  className="text-3xl font-heading mb-2 text-foreground"
                >
                  {drama.title}
                </h2>
                <p className="text-secondary-text mb-4 text-sm">
                  {drama.year}{" "}
                  {drama.genres && drama.genres.length > 0
                    ? `• ${drama.genres.join(", ")}`
                    : ""}
                </p>

                <div className="mb-6">
                  <p className="text-secondary-text text-sm font-medium mb-2">
                    Status:
                  </p>
                  <div className="flex gap-2">
                    {statuses.map((statusInfo) => (
                      <motion.button
                        key={statusInfo.value}
                        onClick={() => onSetStatus(drama.id, statusInfo.value)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          drama.status === statusInfo.value
                            ? "bg-primary-accent text-white shadow-md"
                            : "bg-white/10 text-secondary-text hover:bg-white/20 hover:text-foreground"
                        }`}
                        aria-pressed={drama.status === statusInfo.value}
                        whileHover={buttonHoverEffect}
                        transition={buttonHoverTransition}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6 border-t border-glass-border/30">
                  <motion.button
                    onClick={() => onToggleFavorite(drama.id, drama.favorite)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto ${
                      drama.favorite
                        ? "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30"
                        : "bg-white/10 text-secondary-text hover:bg-white/20 hover:text-foreground"
                    }`}
                    whileHover={buttonHoverEffect}
                    transition={buttonHoverTransition}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        drama.favorite ? "fill-pink-400" : ""
                      }`}
                    />
                    {drama.favorite ? "Favorite" : "Favorite"}
                  </motion.button>
                  <motion.button
                    onClick={() => onDelete(drama.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    whileHover={buttonHoverEffect}
                    transition={buttonHoverTransition}
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
