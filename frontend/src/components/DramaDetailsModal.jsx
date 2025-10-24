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
      if (event.key === "Escape" && isOpen) {
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

  if (!isOpen || !drama) return null;

  const isOnMyList = !!drama.listId;

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

  const handleSetStatus =
    onSetStatus || (() => console.warn("onSetStatus handler not provided"));
  const handleToggleFavorite =
    onToggleFavorite ||
    (() => console.warn("onToggleFavorite handler not provided"));
  const handleDelete = onDelete;

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
            aria-hidden="true"
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
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[95vh] relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-colors z-30"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/3 flex-shrink-0 relative max-h-64 md:max-h-none">
                <img
                  src={drama.poster}
                  alt={`Poster for ${drama.title}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/500x750.png?text=No+Image";
                  }}
                />
                {!isOnMyList && (
                  <div className="absolute top-2 left-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded shadow">
                    Recommendation
                  </div>
                )}
              </div>

              <div
                className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto"
                style={{ perspective: 1000 }}
              >
                <h2
                  id="drama-modal-title"
                  className="text-2xl md:text-3xl font-heading mb-1 md:mb-2 text-foreground pr-8"
                >
                  {drama.title}
                </h2>
                <p className="text-secondary-text mb-3 md:mb-4 text-sm">
                  {drama.year}
                  {drama.genres && drama.genres.length > 0
                    ? `• ${drama.genres.join(", ")}`
                    : ""}
                </p>

                {drama.description && (
                  <p className="text-sm text-secondary-text mb-4 md:mb-6 flex-shrink-0 max-h-28 overflow-y-auto">
                    {drama.description}
                  </p>
                )}

                <div className="mb-5 md:mb-6 flex-shrink-0">
                  <p className="text-secondary-text text-sm font-medium mb-2">
                    {isOnMyList ? "Update Status:" : "Add to List As:"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {statuses.map((statusInfo) => (
                      <motion.button
                        key={statusInfo.value}
                        onClick={() =>
                          handleSetStatus(drama.id, statusInfo.value)
                        }
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

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-auto pt-4 md:pt-6 border-t border-glass-border/30 flex-shrink-0">
                  <motion.button
                    onClick={() =>
                      handleToggleFavorite(drama.id, drama.favorite)
                    }
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto ${
                      drama.favorite
                        ? "bg-pink-500/20 text-pink-300 hover:bg-pink-500/30"
                        : "bg-white/10 text-secondary-text hover:bg-white/20 hover:text-foreground"
                    }`}
                    whileHover={buttonHoverEffect}
                    transition={buttonHoverTransition}
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        drama.favorite ? "fill-pink-400 text-pink-400" : ""
                      }`}
                    />
                    {isOnMyList
                      ? drama.favorite
                        ? "Unfavorite"
                        : "Favorite"
                      : "Add as Favorite"}
                  </motion.button>
                  {isOnMyList && handleDelete && (
                    <motion.button
                      onClick={() => handleDelete(drama.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto bg-red-500/20 text-red-300 hover:bg-red-500/30"
                      whileHover={buttonHoverEffect}
                      transition={buttonHoverTransition}
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete from List
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
