import { motion } from "framer-motion";

const MotionPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.985, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: 10, scale: 0.99 }}
    transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.55 }}
  >
    {children}
  </motion.div>
);

export default MotionPage;
