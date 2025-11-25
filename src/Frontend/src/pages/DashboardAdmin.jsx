import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchInsights } from "../api/insightsApi";
import useTheme from "../hooks/useTheme";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AdminDashboard from "../components/admin/AdminDashboard";

export default function DashboardAdmin() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedChannel, setSelectedChannel] = useState("all"); 
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark, toggleTheme, themeClasses } = useTheme();

  useEffect(() => {
    setLoading(true);
    console.log(`📡 Admin recarregando: ${selectedPeriod} | ${selectedChannel}`);

    fetchInsights(selectedPeriod, { 
        channel: selectedChannel, 
        region: selectedRegion 
    })
      .then((data) => setInsights(data))
      .catch((err) => console.error("Erro:", err))
      .finally(() => setLoading(false));

  }, [selectedPeriod, selectedChannel, selectedRegion]);

  if (loading) return (
      <div className={`${themeClasses.bg} min-h-screen flex items-center justify-center`}>
        {/* Spinner de carregamento... */}
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
  );

  return (
    <motion.div className={`${themeClasses.bg} ${themeClasses.text} min-h-screen flex flex-col transition-colors duration-500`}>
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        muted={themeClasses.muted}
        border={themeClasses.border}
      />

      <main className="flex-1 px-8 py-10">
        {/* AQUI ESTÁ A MUDANÇA: Passamos os filtros para baixo */}
        <AdminDashboard 
          data={insights} 
          isDark={isDark}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />
      </main>

      <Footer muted={themeClasses.muted} border={themeClasses.border} />
    </motion.div>
  );
}