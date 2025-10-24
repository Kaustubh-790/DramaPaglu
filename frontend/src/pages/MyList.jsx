import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox } from "@headlessui/react";
import DramaCard from "../components/DramaCard";
import DramaDetailsModal from "../components/DramaDetailsModal";
import {
  Plus,
  ChevronDown,
  Check,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const genres = [
  "All",
  "Romance",
  "Thriller",
  "Comedy",
  "Fantasy",
  "Action",
  "Drama",
];

const ITEMS_PER_PAGE = 10;

export default function MyList() {
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDramaTitle, setNewDramaTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [addingDrama, setAddingDrama] = useState(false);
  const { api } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/userlist");
        setDramas(data || []);
      } catch (err) {
        console.error("Failed to fetch user list:", err);
        setError(err.message || "Could not load list.");
        setDramas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyList();
  }, [api]);

  const handleAddDrama = async (e) => {
    e.preventDefault();
    if (!newDramaTitle.trim()) return;
    try {
      setAddingDrama(true);
      setError(null);
      const { data: newDrama } = await api.post("/dramas/add", {
        title: newDramaTitle,
      });
      setDramas([newDrama, ...dramas]);
      setNewDramaTitle("");
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to add drama:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to add drama."
      );
    } finally {
      setAddingDrama(false);
    }
  };

  const handleOpenModal = (drama) => {
    setSelectedDrama(drama);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDrama(null), 300);
  };
  const handleToggleFavoriteInModal = async (id, currentFavorite) => {
    try {
      const { data: updatedDrama } = await api.patch(`/userlist/${id}`, {
        dramaId: id,
        favorite: !currentFavorite,
      });
      const updatedList = dramas.map((d) =>
        d.id === updatedDrama.id ? updatedDrama : d
      );
      setDramas(updatedList);
      if (selectedDrama?.id === updatedDrama.id) {
        setSelectedDrama(updatedDrama);
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
      setError(err.response?.data?.message || err.message || "Update failed.");
    }
  };
  const handleSetStatusInModal = async (id, newStatus) => {
    try {
      const { data: updatedDrama } = await api.patch(`/userlist/${id}`, {
        dramaId: id,
        status: newStatus,
      });
      const updatedList = dramas.map((d) =>
        d.id === updatedDrama.id ? updatedDrama : d
      );
      setDramas(updatedList);
      if (selectedDrama?.id === updatedDrama.id) {
        setSelectedDrama(updatedDrama);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || err.message || "Update failed.");
    }
  };
  const handleDeleteDramaInModal = async (id) => {
    try {
      await api.delete(`/userlist/${id}`);
      setDramas(dramas.filter((d) => d.id !== id));
      handleCloseModal();
      const totalPagesAfterDelete = Math.ceil(
        (filteredDramas.length - 1) / ITEMS_PER_PAGE
      );
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      } else if (totalPagesAfterDelete === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to delete drama:", err);
      setError(
        err.response?.data?.message || err.message || "Deletion failed."
      );
    }
  };

  const filteredDramas =
    selectedGenre === "All"
      ? dramas
      : dramas.filter((d) => d.genres?.includes(selectedGenre));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDramas.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const dramasToShow = filteredDramas.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const pageTransitionVariants = {
    initial: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? 100 : -100,
      transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
    }),
  };
  const [swipeDirection, setSwipeDirection] = useState(0);

  return (
    <>
      <div className="min-h-screen w-full relative pt-28 md:pt-32 pb-20">
        <FixedBackground />

        <div className="relative z-10 px-6 space-y-10">
          <section className="max-w-2xl mx-auto pt-0">
            <form onSubmit={handleAddDrama} className="flex gap-4">
              <input
                type="text"
                value={newDramaTitle}
                onChange={(e) => setNewDramaTitle(e.target.value)}
                placeholder="Add a new drama by title..."
                className="flex-grow bg-white/20 backdrop-blur-md border border-white/30 px-5 py-3 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-lg text-sm" // Adjusted style
                disabled={addingDrama}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={addingDrama}
                className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 px-5 py-3 rounded-xl text-white font-bold shadow-lg transition disabled:opacity-50 flex items-center justify-center" // Adjusted style
              >
                {addingDrama ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </motion.button>
            </form>
            {addingDrama && (
              <p className="text-center text-white/80 mt-2 text-xs">
                {" "}
                Fetching drama details...
              </p>
            )}
          </section>
          <section className="flex justify-center">
            <Listbox value={selectedGenre} onChange={setSelectedGenre}>
              <div className="relative w-56">
                <Listbox.Button className="relative w-full cursor-pointer bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-lg text-left text-sm">
                  {" "}
                  <span className="block truncate">{selectedGenre}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown
                      className="h-5 w-5 text-white/80"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <AnimatePresence>
                  <Listbox.Options
                    as={motion.ul}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-background/80 backdrop-blur-lg border border-white/20 py-2 text-base shadow-lg ring-opacity-5 focus:outline-none sm:text-sm z-50"
                  >
                    {[...new Set(genres)].map((genre) => (
                      <Listbox.Option
                        key={genre}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                            active
                              ? "bg-primary-accent/50 text-white"
                              : "text-white/80"
                          }`
                        }
                        value={genre}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected
                                  ? "font-semibold text-white"
                                  : "font-normal"
                              }`}
                            >
                              {genre}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-accent">
                                <Check className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </AnimatePresence>
              </div>
            </Listbox>
          </section>
          {error && (
            <div className="text-center bg-red-500/60 text-white p-3 rounded-lg max-w-lg mx-auto text-sm">
              {" "}
              {error}
            </div>
          )}
          <div className="relative min-h-[400px]">
            {" "}
            <AnimatePresence
              initial={false}
              custom={swipeDirection}
              mode="wait"
            >
              <motion.div
                key={currentPage}
                custom={swipeDirection}
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
              >
                {loading ? (
                  <p className="text-white col-span-full text-center py-20">
                    Loading your list...
                  </p>
                ) : dramasToShow.length > 0 ? (
                  dramasToShow.map((drama) => (
                    <div
                      key={drama.id}
                      className="cursor-pointer"
                      onClick={() => handleOpenModal(drama)}
                    >
                      <DramaCard drama={drama} />
                    </div>
                  ))
                ) : (
                  <p className="text-white col-span-full text-center bg-white/10 backdrop-blur-md border border-white/20 py-6 px-6 rounded-2xl font-medium shadow-lg max-w-lg mx-auto">
                    Your list is empty
                    {selectedGenre !== "All" ? ` for ${selectedGenre}` : ""}.
                    Add a drama!
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {!loading && filteredDramas.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <motion.button
                onClick={() => {
                  setSwipeDirection(-1);
                  handlePrevPage();
                }}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="glass glass-hover p-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </motion.button>

              <span className="text-white font-medium text-sm tabular-nums">
                Page {currentPage} of {totalPages}
              </span>

              <motion.button
                onClick={() => {
                  setSwipeDirection(1);
                  handleNextPage();
                }}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="glass glass-hover p-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
      <DramaDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        drama={selectedDrama}
        onToggleFavorite={handleToggleFavoriteInModal}
        onSetStatus={handleSetStatusInModal}
        onDelete={handleDeleteDramaInModal}
      />
    </>
  );
}

function FixedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <motion.img
        src="/myList.png"
        alt="Hero Background"
        className="w-full h-full object-cover"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/70 to-transparent"></div>
    </div>
  );
}
