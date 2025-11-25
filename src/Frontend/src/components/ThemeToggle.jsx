import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border hover:scale-105 transition-transform border-gray-300"
    >
      {isDark ? <Sun className="text-[#4899f7]" /> : <Moon className="text-[#0075fc]" />}
    </button>
  );
}
