import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchInsights } from "../api/insightsApi";
import useTheme from "../hooks/useTheme";
import useAuth from "../hooks/useAuth"; 
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import KpiGrid from "../components/kpis/KpiGrid";
import RevenueChart from "../components/charts/RevenueChart";
import CampaignsChart from "../components/charts/CampaignsChart";
import ComparisonTable from "../components/table/ComparisonTable";
import CampaignInsights from "../components/insights/CampaignInsights";

export default function DashboardClient() {
  // Pegamos também o loading do Auth para saber se o usuário ainda está sendo verificado
  const { user, loading: authLoading } = useAuth(); 
  
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [insights, setInsights] = useState(null);
  const [dataLoading, setDataLoading] = useState(true); // Renomeei para dataLoading para não confundir
  const { isDark, toggleTheme, themeClasses } = useTheme();

  useEffect(() => {
    // 1. Variável de controle: "Eu ainda sou relevante?"
    let isMounted = true;

    if (authLoading) return;

    // Limpa a tela IMEDIATAMENTE ao trocar de usuário/período
    setInsights(null);

    if (user && user.empresaId) {
      setDataLoading(true);
      console.log("📡 Buscando dados para:", user.empresaId);

      fetchInsights(selectedPeriod, user.empresaId)
        .then((data) => {
          // 2. Só atualiza a tela se o componente ainda estiver montado e for o mesmo usuário
          if (isMounted) {
            setInsights(data);
          }
        })
        .catch((err) => {
          if (isMounted) console.error("Erro:", err);
        })
        .finally(() => {
          if (isMounted) setDataLoading(false);
        });
    } else if (user && !user.empresaId) {
      setDataLoading(false);
    }

    // 3. Função de Limpeza: Roda se o usuário mudar ou o componente morrer
    return () => {
      isMounted = false; // "Cancela" qualquer resposta que chegue atrasada
    };

  }, [selectedPeriod, user, authLoading]); // O 'user' aqui garante que roda na troca

  // 1. Primeiro, mostra loading se o Auth ainda estiver verificando o token
  if (authLoading) {
    return (
      <div className={`${themeClasses.bg} min-h-screen flex items-center justify-center`}>
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. IMPORTANTE: Verifica se NÃO tem empresa ANTES de verificar se tem insights
  // Isso corrige o bug da tela infinita
  if (user && !user.empresaId) {
     return (
        <div className={`${themeClasses.bg} ${themeClasses.text} min-h-screen flex flex-col transition-colors duration-500`}>
             <Header 
                isDark={isDark} 
                toggleTheme={toggleTheme} 
                selectedPeriod={selectedPeriod} 
                setSelectedPeriod={setSelectedPeriod} 
                muted={themeClasses.muted} 
                border={themeClasses.border} 
             />
             
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-yellow-500/10 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Aguardando Vínculo</h2>
                <p className={`${themeClasses.muted} max-w-md`}>
                    Seu usuário ainda não está vinculado a uma empresa. Entre em contato com o administrador para liberar seu acesso aos dados.
                </p>
             </div>

             <Footer muted={themeClasses.muted} border={themeClasses.border} />
        </div>
     );
  }

  // 3. Se tem empresa, mas está carregando os dados ou os dados estão vazios
  if (dataLoading || !insights) {
    return (
      <div className={`${themeClasses.bg} min-h-screen flex flex-col items-center justify-center`}>
        <div className="flex gap-3 items-center">
          <div className="w-3 h-3 rounded-full bg-[#4899f7] animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-[#0075fc] animate-bounce delay-150"></div>
          <div className="w-3 h-3 rounded-full bg-[#00BFA6] animate-bounce delay-300"></div>
        </div>
        <p className={`${themeClasses.muted} mt-4 text-sm`}>
          Carregando métricas...
        </p>
      </div>
    );
  }

  // 4. Se passou por tudo isso, mostra o Dashboard
  return (
    <motion.div
      key={selectedPeriod}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`${themeClasses.bg} ${themeClasses.text} min-h-screen flex flex-col transition-colors duration-500`}
    >
      <Header
        {...{
          isDark,
          toggleTheme,
          selectedPeriod,
          setSelectedPeriod,
          muted: themeClasses.muted,
          border: themeClasses.border,
        }}
      />

      <main className="flex-1 px-8 py-10">
        <KpiGrid resumo={insights?.resumo_geral} isDark={isDark} />
        
        {/* Layout VERTICAL modificado */}
        <div className="mb-10 space-y-8">
          {/* 1. Campanhas Inteligentes - Sozinho no topo */}
          <div>
            <CampaignsChart
              data={insights?.campanhas_inteligentes}
              isDark={isDark}
            />
          </div>
          
          {/* 2. Previsão de Receita - Abaixo, mesmo tamanho */}
          <div>
            <RevenueChart data={insights?.previsao_receita} isDark={isDark} />
          </div>
          
          {/* 3. Insights e Recomendações - Lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CampaignInsights
              insights={insights?.campanha_insights}
              recomendacoes={insights?.recomendacoes}
              isDark={isDark}
            />
            {/* Se você tiver um componente separado para Recomendações, adicione aqui */}
            {/* <RecommendationsCard 
              data={insights?.recomendacoes} 
              isDark={isDark} 
            /> */}
          </div>
        </div>
        
        <ComparisonTable resumo={insights?.resumo_geral} isDark={isDark} />
      </main>

      <Footer muted={themeClasses.muted} border={themeClasses.border} />
    </motion.div>
  );
}