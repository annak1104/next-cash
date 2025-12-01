"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="outline"
      className="hover:border-transparent hover:bg-transparent dark:bg-black"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
      <Moon className="hidden h-[1.2rem] w-[1.2rem] dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
