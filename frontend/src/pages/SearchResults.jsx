import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader, AlertCircle } from "lucide-react";
import DramaCard from "../components/DramaCard";
import DramaDetailsModal from "../components/DramaDetailsModal";
import { useAuth } from "../context/AuthContext";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        setError("No search query provided.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(
          `/dramas/search?q=${encodeURIComponent(query)}`
        );
        const formattedResults = data.map((drama) => ({
          id: drama._id,
          title: drama.title,
          poster: drama.posterUrl,
          genres: drama.genres,
          year: drama.year,
          description: drama.description,
          status: null,
          favorite: null,
        }));
        setResults(formattedResults);
      } catch (err) {
        console.error("Search failed:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch search results."
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, api]);

  const handleOpenModal = (drama) => {
    setSelectedDrama(drama);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDrama(null), 300);
  };

  return (
    <motion.div
      className="min-h-screen pt-28 md:pt-32 pb-20 px-4 md:px-10"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <h1 className="text-3xl md:text-4xl font-heading mb-6 md:mb-8 text-center">
        Search Results for "{query}"
      </h1>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader className="w-10 h-10 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center bg-red-500/20 text-red-300 p-4 rounded-lg max-w-lg mx-auto flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="text-center text-secondary-text py-20">
          No dramas found matching your search.
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {results.map((drama) => (
            <div
              key={drama.id}
              className="cursor-pointer"
              onClick={() => handleOpenModal(drama)}
            >
              <DramaCard drama={drama} />
            </div>
          ))}
        </div>
      )}

      <DramaDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        drama={selectedDrama}
      />
    </motion.div>
  );
}
