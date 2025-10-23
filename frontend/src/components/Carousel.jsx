import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getNewReleases } from "../api/tmdbClient";

function Carousel() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchReleases() {
      const data = await getNewReleases();
      setSlides(data.slice(0, 8));
    }
    fetchReleases();
  }, []);

  const getSlideStyle = (index) => {
    const offset = index - activeIndex;

    if (offset === 0)
      return { x: "0%", scale: 1, rotateY: 0, opacity: 1, zIndex: 3 };
    if (offset === 1)
      return { x: "60%", scale: 0.8, rotateY: -35, opacity: 0.6, zIndex: 2 };
    if (offset === -1)
      return { x: "-60%", scale: 0.8, rotateY: 35, opacity: 0.6, zIndex: 2 };
    return {
      x: offset > 0 ? "100%" : "-100%",
      scale: 0.6,
      rotateY: offset > 0 ? -35 : 35,
      opacity: 0,
      zIndex: 1,
    };
  };

  const DRAG_BUFFER = 30;
  const onDragEnd = (event, info) => {
    const { offset } = info;
    if (Math.abs(offset.x) > DRAG_BUFFER) {
      if (offset.x > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
      } else {
        setActiveIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
      }
    }
  };

  const goToSlide = (index) => setActiveIndex(index);

  return (
    <div className="carousel-wrapper relative w-full h-[450px] flex flex-col items-center justify-center">
      <motion.div
        className="carousel relative flex items-center justify-center perspective-[1200px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={onDragEnd}
      >
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="slide absolute w-[300px] h-[420px] rounded-2xl overflow-hidden shadow-lg cursor-grab bg-neutral-900"
            initial={false}
            animate={getSlideStyle(index)}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${slide.poster_path}`}
              alt={slide.name}
              className="w-full h-full object-cover"
            />
            <motion.div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-1">{slide.name}</h2>
              <p className="text-sm opacity-80">
                {slide.first_air_date?.split("-")[0]}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <div className="pagination absolute bottom-4 flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === activeIndex ? "bg-pink-500" : "bg-gray-500/50"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
