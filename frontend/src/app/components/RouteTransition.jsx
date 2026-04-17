import { AnimatePresence, motion } from "motion/react";
import { useLocation } from "react-router";

const transition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export function RouteTransition({
  children,
  className = "",
  mode = "page",
}) {
  const location = useLocation();

  const variants =
    mode === "shell"
      ? {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -4 },
        }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, y: -4 },
        };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
