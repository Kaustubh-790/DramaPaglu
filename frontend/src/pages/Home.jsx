import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Loader,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DramaCard from "../components/DramaCard";
import DramaDetailsModal from "../components/DramaDetailsModal";
import { useAuth } from "../context/AuthContext";

const genres = ["Romance", "Thriller", "Comedy", "Fantasy", "Action"];

const recommendationCarouselVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function Home() {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("Romance");
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recError, setRecError] = useState(null);
  const { api, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDramaForModal, setSelectedDramaForModal] = useState(null);
  const [isAddingToList, setIsAddingToList] = useState(false);

  const fetchRecommendations = async (forceRefresh = false) => {
    setLoadingRecs(true);
    setRecError(null);
    setRecommendations([]);
    try {
      let endpoint = `/recommendations/${selectedGenre}`;
      if (currentUser) {
        endpoint = `/recommendations/personalized/${selectedGenre}`;
      }
      if (forceRefresh) {
        endpoint += "?refresh=true";
      }

      const { data } = await api.get(endpoint);

      const formattedRecs = (data.recommendations || []).map((rec) => ({
        id: rec._id || rec.title,
        title: rec.title,
        poster: rec.posterUrl || rec.poster,
        year: rec.year,
        genres: rec.genres || [],
        description: rec.description || rec.reason,
        sourceUrl: rec.sourceUrl,
        status: null,
        favorite: null,
        listId: null,
      }));

      setRecommendations(formattedRecs);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecError(
        error.response?.data?.message ||
          error.message ||
          "Could not load recommendations."
      );
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedGenre, currentUser, api]);

  const handleRefreshRecommendations = () => {
    fetchRecommendations(true);
  };

  const handleOpenModal = (drama) => {
    setSelectedDramaForModal(drama);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isAddingToList) return;
    setIsModalOpen(false);
    setTimeout(() => setSelectedDramaForModal(null), 300);
  };

  const handleAddToList = async (dramaData, actionType, value) => {
    if (!currentUser) {
      navigate("/register", { state: { from: location } });
      return;
    }

    if (isAddingToList) return;
    setIsAddingToList(true);

    try {
      const { data: addedDramaToList } = await api.post("/dramas/add", {
        title: dramaData.title,
      });

      const listId = addedDramaToList.id;
      let finalStatus = "planned";
      let finalFavorite = false;

      if (actionType === "setStatus" && value) {
        finalStatus = value;
        await api.patch(`/userlist/${listId}`, {
          dramaId: listId,
          status: finalStatus,
        });
      } else if (actionType === "toggleFavorite") {
        finalFavorite = !dramaData.favorite;
        await api.patch(`/userlist/${listId}`, {
          dramaId: listId,
          favorite: finalFavorite,
        });
      }

      setSelectedDramaForModal((prev) => ({
        ...prev,
        id: listId,
        listId: listId,
        status: finalStatus,
        favorite: finalFavorite,
      }));

      setRecommendations((prevRecs) =>
        prevRecs.filter((rec) => rec.title !== dramaData.title)
      );

      handleCloseModal();
    } catch (error) {
      console.error("Failed to add/update drama in list:", error);

      if (error.response?.data?.message?.includes("already on your list")) {
        alert("This drama is already on your list.");

        setRecommendations((prevRecs) =>
          prevRecs.filter((rec) => rec.title !== dramaData.title)
        );
        handleCloseModal();
      } else {
        alert(
          error.response?.data?.message ||
            error.message ||
            "Failed to add to list."
        );
      }
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleSetStatusForRec = (dramaIdOrTitle, status) => {
    if (!currentUser) {
      navigate("/register", { state: { from: location } });
      return;
    }

    const dramaDetails = recommendations.find(
      (d) => d.id === dramaIdOrTitle || d.title === dramaIdOrTitle
    );
    if (dramaDetails) {
      handleAddToList(dramaDetails, "setStatus", status);
    } else {
      console.error(
        "Could not find drama details to set status for:",
        dramaIdOrTitle
      );
    }
  };

  const handleToggleFavoriteForRec = (dramaIdOrTitle, currentFavorite) => {
    if (!currentUser) {
      navigate("/register", { state: { from: location } });
      return;
    }
    const dramaDetails = recommendations.find(
      (d) => d.id === dramaIdOrTitle || d.title === dramaIdOrTitle
    );

    if (dramaDetails) {
      handleAddToList(dramaDetails, "toggleFavorite", true);
    } else {
      console.error(
        "Could not find drama details to toggle favorite for:",
        dramaIdOrTitle
      );
    }
  };

  return (
    <div className="overflow-x-hidden relative z-0">
      <HeroSection />

      <div className="px-4 md:px-10 space-y-16 pb-20">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-heading whitespace-nowrap">
                Recommended for You
              </h2>
              <motion.button
                onClick={handleRefreshRecommendations}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full glass glass-hover disabled:opacity-50"
                disabled={loadingRecs}
                aria-label="Refresh Recommendations"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingRecs ? "animate-spin" : ""}`}
                />
              </motion.button>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {genres.map((genre) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? "bg-primary-accent text-white shadow-md"
                      : "glass glass-hover text-secondary-text"
                  }`}
                  disabled={loadingRecs}
                >
                  {genre}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedGenre}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative min-h-[300px]"
            >
              {loadingRecs && (
                <div className="absolute inset-0 flex justify-center items-center py-20 text-secondary-text bg-background/30 rounded-lg">
                  <Loader className="w-6 h-6 animate-spin mr-2" />
                  Loading recommendations...
                </div>
              )}
              {recError && !loadingRecs && (
                <div className="text-center bg-red-500/20 text-red-300 p-4 rounded-lg max-w-lg mx-auto">
                  Error: {recError}
                </div>
              )}
              {!loadingRecs && !recError && recommendations.length === 0 && (
                <div className="text-center text-secondary-text py-20">
                  No recommendations found for {selectedGenre}. Try refreshing!
                </div>
              )}
              {!loadingRecs && !recError && recommendations.length > 0 && (
                <DramaCarouselHorizontal
                  dramas={recommendations}
                  onCardClick={handleOpenModal}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <DramaDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        drama={selectedDramaForModal}
        onToggleFavorite={handleToggleFavoriteForRec}
        onSetStatus={handleSetStatusForRec}
        isProcessing={isAddingToList}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="relative h-[80vh] md:h-screen w-full flex items-center justify-center md:justify-end mb-10 md:mb-0">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-20 px-6 md:px-10 lg:px-16 max-w-xl text-center md:text-right"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-foreground drop-shadow-lg leading-tight">
          Your K-Drama Journey Starts Here
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-secondary-text mt-4 ">
          Discover, track, and organize your favorite Korean dramas all in one
          place. Never miss an episode again.
        </p>
      </motion.div>
    </div>
  );
}

function DramaCarouselHorizontal({ dramas, onCardClick }) {
  if (!dramas || dramas.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        variants={recommendationCarouselVariants}
        initial="hidden"
        animate="visible"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {dramas.map((drama) => (
          <motion.div
            key={drama.title || drama.id}
            variants={cardVariants}
            className="w-40 sm:w-48 md:w-52 shrink-0 cursor-pointer"
            onClick={() => onCardClick(drama)}
            style={{ scrollSnapAlign: "start" }}
          >
            <DramaCard drama={drama} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
