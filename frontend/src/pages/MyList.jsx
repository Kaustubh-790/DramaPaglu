import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronDown, Heart, Trash2 } from "lucide-react";

// Sample dramas data
const sampleDramas = [
  {
    id: 1,
    title: "Vincenzo",
    poster:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=750&fit=crop",
    genres: ["Thriller", "Comedy"],
    year: 2021,
    status: "Completed",
    favorite: true,
  },
  {
    id: 2,
    title: "Queen of Tears",
    poster:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=750&fit=crop",
    genres: ["Romance", "Drama"],
    year: 2024,
    status: "Watching",
    favorite: false,
  },
];

const genres = [
  "All",
  "Romance",
  "Thriller",
  "Comedy",
  "Fantasy",
  "Action",
  "Drama",
];

// Drama Card Component
function DramaCard({ drama, onToggleFavorite, onToggleStatus, onDelete }) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -10 }} className="relative group">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <img
          src={drama.poster}
          alt={drama.title}
          className="w-full h-80 object-cover"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <h3 className="text-white font-bold text-lg">{drama.title}</h3>
            <p className="text-gray-300 text-sm">
              {drama.year} • {drama.genres.join(", ")}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={onToggleFavorite}
                className={`p-2 rounded-lg transition ${
                  drama.favorite
                    ? "bg-pink-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${drama.favorite ? "fill-current" : ""}`}
                />
              </button>

              <button
                onClick={onToggleStatus}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition"
              >
                {drama.status}
              </button>

              <button
                onClick={onDelete}
                className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Favorite badge */}
        {drama.favorite && (
          <div className="absolute top-3 right-3 bg-pink-500 p-2 rounded-full shadow-lg">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function MyList() {
  const [dramas, setDramas] = useState(sampleDramas);
  const [newDramaTitle, setNewDramaTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const handleAddDrama = (e) => {
    e.preventDefault();
    if (!newDramaTitle.trim()) return;

    const newDrama = {
      id: Date.now(),
      title: newDramaTitle,
      poster:
        "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=500&h=750&fit=crop",
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
        const statuses = ["Want to Watch", "Watching", "Completed"];
        const currentIndex = statuses.indexOf(d.status);
        const newStatus = statuses[(currentIndex + 1) % statuses.length];
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
    <div className="min-h-screen w-full relative">
      <div className="fixed inset-0 z-0">
        <img
          src="/myList.png"
          alt="Background"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 backdrop-blur-[3px] bg-white/1"></div>
      </div>

      <div className="relative z-10 px-6 py-10 space-y-10 pt-20">
        <section className="max-w-2xl mx-auto pt-10">
          <form onSubmit={handleAddDrama} className="flex gap-4">
            <input
              type="text"
              value={newDramaTitle}
              onChange={(e) => setNewDramaTitle(e.target.value)}
              placeholder="Add a new drama by title (e.g., Queen of Tears)"
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
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-white/20 backdrop-blur-md border border-white/30 appearance-none px-8 py-4 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-400/50 pr-12 shadow-lg cursor-pointer"
            >
              {genres.map((g) => (
                <option key={g} value={g} className="bg-gray-800 text-white">
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-white absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </section>

        <section className="max-w-7xl mx-auto">
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

          {filteredDramas.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white text-xl font-medium">
                No dramas found in this category
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
