import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DramaCard from "../components/DramaCard";
import DramaDetailsModal from "../components/DramaDetailsModal";
import { useAuth } from "../context/AuthContext";

const genres = ["Romance", "Thriller", "Comedy", "Fantasy", "Action"];

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

const recommendationCarouselVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function Home() {
  const [topDramas, setTopDramas] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("Romance");
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recError, setRecError] = useState(null);
  const { api, currentUser } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDramaForModal, setSelectedDramaForModal] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      setRecError(null);
      setRecommendations([]);
      try {
        let endpoint = `/recommendations/${selectedGenre}`;
        if (currentUser) {
          endpoint = `/recommendations/personalized/${selectedGenre}`;
        }
        const { data } = await api.get(endpoint);

        const formattedRecs = (data.recommendations || []).map((rec) => ({
          id: rec.id || rec.title,
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
    fetchRecommendations();
  }, [selectedGenre, api, currentUser]);

  const handleOpenModal = (drama) => {
    setSelectedDramaForModal(drama);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setTimeout(() => setSelectedDramaForModal(null), 300);
  };

  const handleAddToList = async (dramaData, actionType, value) => {
    if (!currentUser) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      const { data: addedDramaToList } = await api.post("/dramas/add", {
        title: dramaData.title,
      });
      console.log("addedDramaToList:", addedDramaToList);

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

      console.log(
        `Drama added to list with ID: ${listId} and ${actionType} set`
      );
    } catch (error) {
      console.error("Failed to add/update drama in list:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to add to list."
      );
    }
  };

  const handleSetStatusForRec = (dramaId, status) => {
    const dramaDetails = recommendations.find(
      (d) => d.id === dramaId || d.title === dramaId
    );
    if (dramaDetails) {
      handleAddToList(dramaDetails, "setStatus", status);
    } else {
      console.error(
        "Could not find drama details to set status for ID:",
        dramaId
      );
    }
  };

  const handleToggleFavoriteForRec = (dramaId, currentFavorite) => {
    const dramaDetails = recommendations.find(
      (d) => d.id === dramaId || d.title === dramaId
    );
    if (dramaDetails) {
      handleAddToList(dramaDetails, "toggleFavorite", !currentFavorite);
    } else {
      console.error(
        "Could not find drama details to toggle favorite for ID:",
        dramaId
      );
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="overflow-x-hidden"
    >
      <HeroSection />

      <div className="px-4 md:px-10 space-y-16 pb-20 mt-[-100px] relative z-10">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-heading whitespace-nowrap">
              Recommended for You
            </h2>
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
              className="relative"
            >
              {loadingRecs && (
                <div className="flex justify-center items-center py-20 text-secondary-text">
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
                  No recommendations found for {selectedGenre}.
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
      />
    </motion.div>
  );
}

function HeroSection() {
  return (
    <div className="relative h-[80vh] md:h-screen w-full overflow-hidden flex items-center justify-center md:justify-end">
      <div className="absolute inset-0 z-0">
        <motion.img
          src="/hero.png"
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
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!dramas || dramas.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      <motion.div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar -mx-4 px-4"
        variants={recommendationCarouselVariants}
        initial="hidden"
        animate="visible"
      >
        {dramas.map((drama) => (
          <motion.div
            key={drama.id || drama.title}
            variants={cardVariants}
            className="w-48 shrink-0 cursor-pointer"
            onClick={() => onCardClick(drama)}
          >
            <DramaCard drama={drama} />
          </motion.div>
        ))}
      </motion.div>
      {dramas.length > 4 && (
        <>
          <motion.button
            onClick={() => scroll("left")}
            className="glass glass-hover absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>

          <motion.button
            onClick={() => scroll("right")}
            className="glass glass-hover absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </>
      )}
    </div>
  );
}
