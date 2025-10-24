// filename: frontend/src/pages/MyList.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DramaCard from "../components/DramaCard";
import { Plus, ChevronDown } from "lucide-react";
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
      const { data: newDrama } = await api.post("/api/dramas/add", {
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
    <div className="space-y-10 pb-20">
      <section>
        <form onSubmit={handleAddDrama} className="flex gap-4 max-w-lg mx-auto">
          <input
            type="text"
            value={newDramaTitle}
            onChange={(e) => setNewDramaTitle(e.target.value)}
            placeholder="Add a new drama by title (e.g., Queen of Tears)"
            className="flex-grow glass px-5 py-3 rounded-xl text-foreground placeholder-secondary-text focus:outline-none focus:border-primary-accent/50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="glass glass-hover px-5 py-3 rounded-xl text-foreground font-bold"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </form>
      </section>

      <section className="flex justify-center">
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="glass glass-hover appearance-none px-6 py-3 rounded-xl text-foreground font-medium focus:outline-none focus:border-primary-accent/50 pr-10"
          >
            {genres.map((g) => (
              <option
                key={g}
                value={g}
                className="bg-background text-foreground"
              >
                {g}
              </option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 text-secondary-text absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </section>

      {error && (
        <div className="text-center bg-red-500/20 text-red-300 p-3 rounded-lg max-w-lg mx-auto">
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
          <p className="text-secondary-text col-span-full text-center">
            Your list is empty. Add a drama to get started!
          </p>
        )}
      </motion.div>
    </div>
  );
}
