import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Carousel from "../components/carousel";
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

export default function Home() {
  const [topDramas, setTopDramas] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("Romance");
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();

  useEffect(() => {
    const fetchTopDramas = async () => {
      try {
        const { data } = await api.get("/dramas/scrape/top");
        setTopDramas(data.dramas || []);
      } catch (error) {
        console.error("Failed to fetch top dramas:", error);
      }
    };
    fetchTopDramas();
  }, [api]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/recommendations/${selectedGenre}`);
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [selectedGenre, api]);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <HeroSection />

      <div className="px-4 md:px-10 space-y-10 pb-20">
        <DramaCarousel title="Trending Now" dramas={topDramas} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading">Recommended for You</h2>
            <div className="flex gap-2">
              {genres.map((genre) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGenre === genre
                      ? "bg-primary-accent text-white"
                      : "glass glass-hover text-secondary-text"
                  }`}
                >
                  {genre}
                </motion.button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-secondary-text text-center py-10">
              Loading recommendations...
            </p>
          ) : (
            <DramaCarousel dramas={recommendations} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-end">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.png"
          alt="Hero Background"
          className="w-full h-full object-cover animate-kenBurns"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 px-4 md:px-10 lg:px-16 max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-heading text-foreground drop-shadow-lg">
          The Ultimate K-Drama Companion
        </h1>
        <p className="text-lg md:text-xl text-secondary-text mt-4 max-w-lg">
          Discover, track, and organize your favorite Korean dramas all in one
          place
        </p>
        {/* <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 10px rgba(194, 68, 42, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3 glass text-foreground font-heading font-bold text-lg rounded-xl shadow-lg transition-all"
        >
          Get Started
        </motion.button> */}
      </motion.div>
    </div>
  );
}

function DramaCarousel({ title, dramas }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
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
      {title && <h2 className="text-2xl font-heading mb-4">{title}</h2>}
      <div className="relative">
        {title && (
          <div className="app-container mb-6">
            <Carousel />
          </div>
        )}

        <motion.button
          onClick={() => scroll("left")}
          className="glass glass-hover absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 -mb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dramas.map((drama) => (
            <TiltableGlassCard key={drama.title || drama.id} drama={drama} />
          ))}
        </div>

        <motion.button
          onClick={() => scroll("right")}
          className="glass glass-hover absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}

function TiltableGlassCard({ drama }) {
  const getStatusBadge = () => {
    if (drama.status === "completed") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-secondary-accent/90 text-foreground">
          Completed
        </div>
      );
    }
    if (drama.status === "ongoing") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-tertiary-accent/90 text-background">
          Ongoing
        </div>
      );
    }
    return null;
  };

  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.1}
      glareColor="var(--foreground)"
      glarePosition="all"
      glareBorderRadius="16px"
      scale={1.05}
      perspective={1000}
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      transitionSpeed={1500}
      className="glass rounded-2xl w-48 h-72 shrink-0 relative overflow-hidden"
    >
      <img
        src={drama.posterUrl || drama.poster}
        alt={drama.title}
        className="w-full h-full object-cover absolute inset-0 z-0"
      />

      {getStatusBadge()}

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 via-background/60 to-transparent z-10">
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <h4 className="text-base font-heading text-foreground line-clamp-2">
              {drama.title}
            </h4>
            {drama.year && (
              <p className="text-xs text-secondary-text">{drama.year}</p>
            )}
            {drama.reason && (
              <p className="text-xs text-secondary-text line-clamp-2 mt-1">
                {drama.reason}
              </p>
            )}
          </div>
        </div>
      </div>
    </Tilt>
  );
}
