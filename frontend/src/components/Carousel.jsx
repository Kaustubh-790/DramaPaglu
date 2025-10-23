import React, { useState } from "react";
import { motion } from "framer-motion";

const slides = [
  { id: 1, title: "A Class", className: "slide--one" },
  { id: 2, title: "B Class", className: "slide--two" },
  { id: 3, title: "C Class", className: "slide--three" },
  { id: 4, title: "D Class", className: "slide--four" },
  { id: 5, title: "E Class", className: "slide--five" },
  { id: 6, title: "G Class", className: "slide--six" },
];

function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const getSlideStyle = (index) => {
    const offset = index - activeIndex;

    if (offset === 0) {
      return {
        x: "0%",
        scale: 1,
        rotateY: 0,
        opacity: 1,
        zIndex: 3,
        filter: "grayscale(0)",
      };
    }

    if (offset === 1) {
      return {
        x: "60%",
        scale: 0.8,
        rotateY: -35,
        opacity: 0.6,
        zIndex: 2,
        filter: "grayscale(0.6)",
      };
    }

    if (offset === -1) {
      return {
        x: "-60%",
        scale: 0.8,
        rotateY: 35,
        opacity: 0.6,
        zIndex: 2,
        filter: "grayscale(0.6)",
      };
    }

    return {
      x: offset > 0 ? "100%" : "-100%",
      scale: 0.6,
      rotateY: offset > 0 ? -35 : 35,
      opacity: 0,
      zIndex: 1,
      filter: "grayscale(0.6)",
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

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="carousel-wrapper">
      <motion.div
        className="carousel"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={onDragEnd}
      >
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className={`slide ${slide.className}`}
            initial={false}
            animate={getSlideStyle(index)}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <motion.div
              className="slide-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <h2>{slide.title}</h2>
              <a href="#">explore</a>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <div className="pagination">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`pagination-dot ${
              index === activeIndex ? "active" : ""
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
