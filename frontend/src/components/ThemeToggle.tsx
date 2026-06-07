"use client";
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 bg-muted text-foreground border border-border rounded-xl transition-all hover:bg-accent hover:shadow-sm flex items-center gap-2 text-sm font-medium"
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {theme === "light" ? (
        <>
          <Moon className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline text-muted-foreground font-semibold">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-warning" />
          <span className="hidden sm:inline text-muted-foreground font-semibold">Light Mode</span>
        </>
      )}
    </button>
  );
}