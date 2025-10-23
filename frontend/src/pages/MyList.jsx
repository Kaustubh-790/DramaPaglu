import { sampleDramas } from "../data/sampleDramas";
import AccordionCard from "../components/Accordion";
import { motion } from "framer-motion";

export default function MyList() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sampleDramas.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <AccordionCard drama={d} />
        </motion.div>
      ))}
    </div>
  );
}
