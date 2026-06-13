"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-card/50 border border-primary/30 hover:border-primary transition-all duration-300 group"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-primary relative z-10" />
      ) : (
        <Sun className="w-5 h-5 text-primary relative z-10" />
      )}
    </motion.button>
  );
}