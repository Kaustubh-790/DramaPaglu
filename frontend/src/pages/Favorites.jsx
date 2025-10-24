import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox } from "@headlessui/react";
import { ChevronDown, Check, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Carousel from "../components/carousel";

const genres = [
  "All",
  "Romance",
  "Thriller",
  "Comedy",
  "Fantasy",
  "Action",
  "Drama",
];

export default function Favorites() {
  const [favoriteDramas, setFavoriteDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { api } = useAuth();

  useEffect(() => {
    const fetchMyFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/userlist/favorites");
        setFavoriteDramas(data || []);
      } catch (err) {
        console.error("Failed to fetch user favorites:", err);
        setError(err.message || "Could not load favorites.");
        setFavoriteDramas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyFavorites();
  }, [api]);

  const filteredDramas =
    selectedGenre === "All"
      ? favoriteDramas
      : favoriteDramas.filter(
          (d) => d.genres && d.genres.includes(selectedGenre)
        );

  return (
    <div className="min-h-screen w-full relative pt-28 md:pt-32 flex flex-col">
      {" "}
      <div className="fixed inset-0 z-0">
        <img
          src="/myList(dark).png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 backdrop-blur-[4px] bg-black/40"></div>
      </div>
      <div className="relative z-10 px-4 md:px-10 pb-10 space-y-8 flex-grow flex flex-col">
        <h1 className="text-3xl md:text-4xl font-heading text-center text-white mb-6 md:mb-8 flex-shrink-0">
          {" "}
          My Favorites
        </h1>

        <section className="flex justify-center flex-shrink-0">
          {" "}
          <Listbox value={selectedGenre} onChange={setSelectedGenre}>
            <div className="relative w-56">
              <Listbox.Button className="relative w-full cursor-pointer bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-pink-400/50 shadow-lg text-left text-sm">
                <span className="block truncate">{selectedGenre}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown
                    className="h-5 w-5 text-white/80"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <AnimatePresence>
                <Listbox.Options
                  as={motion.ul}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-background/80 backdrop-blur-lg border border-white/20 py-2 text-base shadow-lg ring-opacity-5 focus:outline-none sm:text-sm z-50"
                >
                  {genres.map((genre) => (
                    <Listbox.Option
                      key={genre}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2.5 pl-10 pr-4 ${
                          active
                            ? "bg-primary-accent/50 text-white"
                            : "text-white/80"
                        }`
                      }
                      value={genre}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected
                                ? "font-semibold text-white"
                                : "font-normal"
                            }`}
                          >
                            {genre}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-accent">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </AnimatePresence>
            </div>
          </Listbox>
        </section>
        <section className="mt-6 md:mt-8 flex-grow flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center text-white py-10">
              <Loader className="w-8 h-8 animate-spin mb-3" />
              Loading your favorites...
            </div>
          ) : error ? (
            <div className="text-center bg-red-500/60 text-white p-4 rounded-lg max-w-lg mx-auto">
              Error: {error}
            </div>
          ) : (
            <Carousel dramas={filteredDramas} />
          )}
        </section>
      </div>
    </div>
  );
}
