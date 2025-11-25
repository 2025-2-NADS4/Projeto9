import { useState, useEffect } from "react";

export default function useTheme() {
  // 🌓 Inicializa com base no localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? JSON.parse(saved) : true; // padrão: modo escuro
  });

  // 💾 Salva toda vez que mudar
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDark));
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const themeClasses = isDark
    ? {
        bg: "bg-[#0F0F0F]",
        text: "text-[#EAEAEA]",
        muted: "text-gray-400",
        border: "border-gray-800",
        card: "bg-[#1C1C1C]",
      }
    : {
        bg: "bg-[#F8F8F8]",
        text: "text-[#222]",
        muted: "text-gray-600",
        border: "border-gray-300",
        card: "bg-white",
      };

  return { isDark, toggleTheme, themeClasses };
}
