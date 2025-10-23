import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { sampleDramas } from "../data/sampleDramas";

const genres = ["All", "Romance", "Thriller", "Comedy", "Fantasy", "Action"];
const trendingDramas = sampleDramas;
const newReleases = [...sampleDramas].reverse();

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
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-10 pb-20"
    >
      <HeroSection />
      <GenreFilters />
      <DramaCarousel title="Trending Now" dramas={trendingDramas} />
      <DramaCarousel title="New Releases" dramas={newReleases} />
    </motion.div>
  );
}

function HeroSection() {
  return (
    <div className="relative h-screen w-screen -mx-4 md:-mx-10 lg:-mx-16 overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src="hero.png"
          alt="Hero Background"
          className="w-full h-full object-cover animate-kenBurns"
        />
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/70 to-transparent" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-20 px-4 md:px-10 lg:px-16 max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-heading text-foreground drop-shadow-lg">
          Track. Discover.
        </h1>
        <h1 className="text-4xl md:text-6xl font-heading text-foreground drop-shadow-lg">
          Fall in love again.
        </h1>
        <p className="text-lg md:text-xl text-secondary-text mt-4 max-w-lg">
          Your personal, premium space for all things K-Drama. Never lose track
          of a masterpiece.
        </p>
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px var(--primary-accent)",
          }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3 bg-primary-accent text-foreground font-heading font-bold text-lg rounded-xl shadow-lg transition-all"
        >
          Explore My List
        </motion.button>
      </motion.div>
    </div>
  );
}

function GenreFilters() {
  const [activeGenre, setActiveGenre] = useState("All");

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
      {genres.map((genre) => (
        <motion.button
          key={genre}
          onClick={() => setActiveGenre(genre)}
          className={`glass-hover glass shrink-0 px-5 py-2 rounded-full font-medium transition-colors ${
            activeGenre === genre
              ? "bg-tertiary-accent/80 text-background border-tertiary-accent"
              : "text-secondary-text"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {genre}
        </motion.button>
      ))}
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

  return (
    <div className="relative">
      <h2 className="text-2xl font-heading mb-4">{title}</h2>
      <div className="relative">
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
          className="flex gap-4 overflow-x-auto pb-4 -mb-4 -mx-4 px-4 group"
          style={{ scrollbarWidth: "none" }}
        >
          {dramas.map((drama) => (
            <TiltableGlassCard key={drama.id} drama={drama} />
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
    if (drama.status === "Completed") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-secondary-accent/90 text-foreground">
          {drama.status}
        </div>
      );
    }
    if (drama.status === "Watching") {
      return (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-bold bg-tertiary-accent/90 text-background">
          {drama.status}
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
        src={drama.poster}
        alt={drama.title}
        className="w-full h-full object-cover absolute inset-0 z-0"
      />
      {getStatusBadge()}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 via-background/60 to-transparent z-10">
        <div className="flex justify-between items-end">
          <h4 className="text-base font-heading text-foreground line-clamp-2">
            {drama.title}
          </h4>
          <Heart
            className={`w-5 h-5 shrink-0 ml-2 transition-colors ${
              drama.favorite
                ? "text-primary-accent fill-primary-accent"
                : "text-foreground"
            }`}
          />
        </div>
      </div>
    </Tilt>
  );
}
