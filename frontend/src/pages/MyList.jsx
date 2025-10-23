import { useState } from "react";
import { motion } from "framer-motion";
import { sampleDramas } from "../data/sampleDramas";
import DramaCard from "../components/DramaCard"; // New component
import { Plus, ChevronDown } from "lucide-react";

// Add release year to sample data for display
const initialDramas = sampleDramas.map((d) => ({
  ...d,
  year: d.title === "Vincenzo" ? 2021 : 2024,
}));

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
  const [dramas, setDramas] = useState(initialDramas);
  const [newDramaTitle, setNewDramaTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const handleAddDrama = (e) => {
    e.preventDefault();
    if (!newDramaTitle.trim()) return;

    // In a real app, this would call the backend/scraper.
    // For now, we'll add a placeholder card.
    const newDrama = {
      id: Date.now(),
      title: newDramaTitle,
      poster: "https://via.placeholder.com/500x750.png?text=Loading...", // Placeholder poster
      genres: ["Unknown"],
      year: new Date().getFullYear(),
      status: "Want to Watch",
      favorite: false,
    };

    setDramas([newDrama, ...dramas]);
    setNewDramaTitle("");
  };

  const handleToggleFavorite = (id) => {
    setDramas(
      dramas.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
    );
  };

  const handleToggleStatus = (id) => {
    setDramas(
      dramas.map((d) => {
        if (d.id !== id) return d;
        const newStatus = d.status === "Watching" ? "Completed" : "Watching";
        return { ...d, status: newStatus };
      })
    );
  };

  const handleDeleteDrama = (id) => {
    setDramas(dramas.filter((d) => d.id !== id));
  };

  const filteredDramas =
    selectedGenre === "All"
      ? dramas
      : dramas.filter((d) => d.genres.includes(selectedGenre));

  return (
    <div className="space-y-10 pb-20">
      {/* Search/Add Input */}
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

      {/* Genre Filter */}
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

      {/* Dynamic Drama Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {filteredDramas.map((drama, i) => (
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
              onToggleFavorite={() => handleToggleFavorite(drama.id)}
              onToggleStatus={() => handleToggleStatus(drama.id)}
              onDelete={() => handleDeleteDrama(drama.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
