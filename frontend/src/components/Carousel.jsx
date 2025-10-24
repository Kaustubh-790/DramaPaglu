import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Carousel({ dramas = [] }) {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideRef = useRef(null);

  useEffect(() => {
    const formattedDramas = dramas.map((drama) => ({
      id: drama.id,
      poster_path: drama.poster,
      name: drama.title,
      first_air_date: drama.year ? `${drama.year}-01-01` : null,
    }));
    // Limit slides if needed, or show all favorites
    // setSlides(formattedDramas.slice(0, 8));
    setSlides(formattedDramas);
    setActiveIndex(0);
  }, [dramas]);

  const getSlideStyle = (index) => {
    const offset = index - activeIndex;
    const slideWidth = slideRef.current ? slideRef.current.offsetWidth : 300;
    const gap = 30;
    const visibleOffset = slideWidth * 0.7 + gap;

    if (offset === 0) {
      return { x: "0%", scale: 1, rotateY: 0, opacity: 1, zIndex: 3 };
    } else if (offset === 1) {
      return {
        x: `${visibleOffset / 2}px`,
        scale: 0.8,
        rotateY: -35,
        opacity: 0.4,
        zIndex: 2,
      };
    } else if (offset === -1) {
      return {
        x: `-${visibleOffset / 2}px`,
        scale: 0.8,
        rotateY: 35,
        opacity: 0.4,
        zIndex: 2,
      };
    } else if (offset === 2) {
      return {
        x: `${visibleOffset * 1.0}px`,
        scale: 0.65,
        rotateY: -40,
        opacity: 0.1,
        zIndex: 1,
      };
    } else if (offset === -2) {
      return {
        x: `-${visibleOffset * 1.0}px`,
        scale: 0.65,
        rotateY: 40,
        opacity: 0.1,
        zIndex: 1,
      };
    }
    return {
      x: offset > 0 ? "200%" : "-200%",
      scale: 0.5,
      rotateY: offset > 0 ? -60 : 60,
      opacity: 0,
      zIndex: 0,
    };
  };

  const DRAG_BUFFER = 30;
  const onDragEnd = (event, info) => {
    const { offset } = info;
    if (slides.length <= 1) return;

    if (Math.abs(offset.x) > DRAG_BUFFER) {
      if (offset.x > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  const goToSlide = (index) => setActiveIndex(index);

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="text-center text-secondary-text py-10">
        No favorite dramas to display.
      </div>
    );
  }

  return (
    <div className="carousel-container group relative w-full h-[600px] flex flex-col items-center justify-center pt-8 pb-12">
      {slides.length > 1 && (
        <motion.button
          onClick={handlePrev}
          className="glass glass-hover absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={slides.length <= 1}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-foreground" />
        </motion.button>
      )}

      <motion.div
        className="carousel-slides relative flex items-center justify-center perspective-[1200px] w-full h-[450px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={onDragEnd}
      >
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            ref={index === 0 ? slideRef : null}
            className="slide-card absolute w-[300px] h-[420px] rounded-2xl overflow-hidden shadow-lg cursor-grab bg-neutral-900/80"
            initial={false}
            animate={getSlideStyle(index)}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <div className="relative w-full h-full">
              <img
                src={
                  slide.poster_path?.startsWith("http")
                    ? slide.poster_path
                    : `https://image.tmdb.org/t/p/w500${slide.poster_path}`
                }
                alt={slide.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x750.png?text=No+Image";
                }}
              />
            </div>

            <motion.div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-1 line-clamp-2">
                {slide.name}
              </h2>
              <p className="text-base opacity-80">
                {slide.first_air_date
                  ? slide.first_air_date.split("-")[0]
                  : "N/A"}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {slides.length > 1 && (
        <motion.button
          onClick={handleNext}
          className="glass glass-hover absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={slides.length <= 1}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-foreground" />
        </motion.button>
      )}

      {slides.length > 1 && (
        <div className="pagination flex gap-2 mt-8">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-300 ${
                index === activeIndex
                  ? "bg-primary-accent"
                  : "bg-gray-500/50 hover:bg-gray-400/50"
              }`}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 500 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
