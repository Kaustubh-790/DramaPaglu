import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox } from "@headlessui/react";
import DramaCard from "../components/DramaCard";
import { Plus, ChevronDown, Check } from "lucide-react";
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

export default function MyList() {
  const [dramas, setDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDramaTitle, setNewDramaTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { api } = useAuth();

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/userlist");
        setDramas(data);
      } catch (err) {
        console.error("Failed to fetch user list:", err);
        setError(err.message);
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
      const { data: newDrama } = await api.post("/dramas/add", {
        title: newDramaTitle,
      });

      setDramas([newDrama, ...dramas]);
      setNewDramaTitle("");
    } catch (err) {
      console.error("Failed to add drama:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleToggleFavorite = async (id, currentFavorite) => {
    try {
      const { data: updatedDrama } = await api.patch(`/userlist/update/${id}`, {
        dramaId: id,
        favorite: !currentFavorite,
      });
      setDramas(
        dramas.map((d) => (d.id === updatedDrama.id ? updatedDrama : d))
      );
    } catch (err) {
      console.error("Failed to update favorite:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Watching" ? "completed" : "watching";
    try {
      const { data: updatedDrama } = await api.patch(`/userlist/update/${id}`, {
        dramaId: id,
        status: newStatus,
      });
      setDramas(
        dramas.map((d) => (d.id === updatedDrama.id ? updatedDrama : d))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteDrama = async (id) => {
    try {
      await api.delete(`/userlist/${id}`);
      setDramas(dramas.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete drama:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const filteredDramas =
    selectedGenre === "All"
      ? dramas
      : dramas.filter((d) => d.genres.includes(selectedGenre));

  return (
    <div className="min-h-screen w-full relative pt-20">
      <div className="fixed inset-0 z-0">
        <img
          src="/myList.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 backdrop-blur-[3px] bg-white/10"></div>
      </div>

      <div className="relative z-10 px-6 py-10 space-y-10">
        <section className="max-w-2xl mx-auto pt-10">
          <form onSubmit={handleAddDrama} className="flex gap-4">
            <input
              type="text"
              value={newDramaTitle}
              onChange={(e) => setNewDramaTitle(e.target.value)}
              placeholder="Add a new drama by title"
              className="flex-grow bg-white/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-lg"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 px-6 py-4 rounded-2xl text-white font-bold shadow-lg transition"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </form>
        </section>

        <section className="flex justify-center">
          <Listbox value={selectedGenre} onChange={setSelectedGenre}>
            <div className="relative w-56">
              <Listbox.Button className="relative w-full cursor-pointer bg-white/20 backdrop-blur-md border border-white/30 px-6 py-4 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-lg text-left">
                <span className="block truncate">{selectedGenre}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <ChevronDown
                    className="h-5 w-5 text-white"
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
                  className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 py-2 text-base shadow-lg  ring-opacity-5 focus:outline-none sm:text-sm z-50"
                >
                  {genres.map((genre) => (
                    <Listbox.Option
                      key={genre}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                          active ? "bg-pink-400/30 text-white" : "text-white/80"
                        }`
                      }
                      value={genre}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-bold text-white" : "font-normal"
                            }`}
                          >
                            {genre}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-400">
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
          <div className="text-center bg-red-500/60 text-white-300 p-3 rounded-lg max-w-lg mx-auto">
            {error}
          </div>
        )}

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {loading ? (
            <p className="text-secondary-text col-span-full text-center">
              Loading your list...
            </p>
          ) : filteredDramas.length > 0 ? (
            filteredDramas.map((drama, i) => (
              <motion.div
                key={drama.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
              >
                <DramaCard
                  drama={drama}
                  onToggleFavorite={() =>
                    handleToggleFavorite(drama.id, drama.favorite)
                  }
                  onToggleStatus={() =>
                    handleToggleStatus(drama.id, drama.status)
                  }
                  onDelete={() => handleDeleteDrama(drama.id)}
                />
              </motion.div>
            ))
          ) : (
            <p className="text-secondary-text col-span-full text-center bg-white/20 backdrop-blur-md border border-white/30 appearance-none py-4 rounded-2xl text-white font-medium  pr-12 shadow-lg">
              Your list is empty. Add a drama to get started!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
