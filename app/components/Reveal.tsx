"use client"
import { motion } from "framer-motion";
import React from "react";

type Direction = "up" | "down" | "left" | "right";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  distance = 24,
  direction = "up",
}: React.PropsWithChildren<{
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: Direction;
}>) {
  const from = (() => {
    switch (direction) {
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return { y: distance };
    }
  })();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
