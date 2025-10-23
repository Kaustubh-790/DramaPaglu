import { motion } from "framer-motion";
import Accordion from "../components/Accordion";
import img1 from "../../public/1.png";
import img2 from "../../public/2.png";

const images = [
  { header: "img1", image: img1, text: "img1 desc" },
  { header: "img2", image: img2, text: "img2 desc" },
];

export default function Home() {
  return (
    <div className="text-center mt-10 space-y-10">
      <div>
        <Accordion items={images} />
      </div>
    </div>
  );
}
