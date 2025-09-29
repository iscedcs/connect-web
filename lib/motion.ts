// lib/motion.ts
import { Variants } from "framer-motion";

export const pressable: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

export const iconPress: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.06 },
  tap: { scale: 0.94 },
};
