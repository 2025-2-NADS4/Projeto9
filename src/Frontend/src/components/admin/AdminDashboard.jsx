import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Filter, MapPin, Download } from "lucide-react";
import AdminKpiGrid from "../kpis/AdminKpiGrid";
import StoreChart from "../charts/StoreChart";
import CampaignsChartAdmin from "../charts/CampaignsChartAdmin";
import AdminSuggestions from "../insights/AdminSuggestions";
import CampaignSimulator from "../simulador/CampaignSimulator";
import { exportReport } from "../../api/insightsApi";
import CampaignsEngagement from "../charts/CampaignsEngagement";

export default function AdminDashboard({ 
  data, 
  isDark,
  selectedChannel,
  setSelectedChannel,
  selectedRegion,
  setSelectedRegion
}) {
  const [metric, setMetric] = useState("receita");

  // DEBUG: Verificar dados quando chegarem
  useEffect(() => {
    if (data) {
      console.log("🎯 DADOS RECEBIDOS NO ADMIN DASHBOARD:", data);
      console.log("📊 Campanhas disponíveis:", data.campanhas_resumo);
      console.log("🏪 Lojas disponíveis:", data.lojas_top);
      console.log("💰 Resumo geral:", data.resumo_geral);
      console.log("📋 Recomendações recebidas:", data?.recomendacoes);
console.log("📊 Tipo das recomendações:", typeof data?.recomendacoes);
console.log("🎯 DADOS PARA SUGESTÕES:", {
  temData: !!data,
  temRecomendacoes: data?.recomendacoes,
  quantidade: data?.recomendacoes?.length,
  recomendacoes: data?.recomendacoes
});
    }
  }, [data]);

  if (!data) {
    console.log("⏳ Aguardando dados...");
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  const resumo = data.resumo_geral || {};
  const lojasData = data.lojas_top || [];
  
  // CORREÇÃO: Use a chave correta e adicione debug
  console.log("🔍 Campanhas antes do filtro:", data.campanhas_resumo);
  const campanhasFiltradas = (data.campanhas_resumo || []).filter(c => {
    const temTaxaResposta = c.taxa_resposta !== undefined;
    if (!temTaxaResposta) {
      console.log("❌ Campanha sem taxa_resposta:", c);
    }
    return temTaxaResposta && c.taxa_resposta <= 100;
  });
  
  console.log("✅ Campanhas após filtro:", campanhasFiltradas);

  // === SOLUÇÃO INFALÍVEL (Estilos em Linha) ===
  const styleSelect = {
    color: isDark ? "#ffffff" : "#000000",
    backgroundColor: "transparent",
    cursor: "pointer"
  };

  const styleOption = {
    color: isDark ? "#ffffff" : "#000000",
    backgroundColor: isDark ? "#1C1C1C" : "#ffffff"
  };

  const containerClass = `
    flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm transition-all duration-200
    ${isDark ? "border-gray-700 bg-transparent hover:bg-white/10" : "border-gray-300 bg-white hover:bg-gray-50"}
  `;

  return (
    <div className="space-y-10" >
      
      {/* === CABEÇALHO === */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4899f7] to-[#0075fc] bg-clip-text text-transparent">
          Informações Gerais
        </h2>

        <div className="flex flex-wrap gap-3">
            
            {/* 1. Métrica */}
            <div className={containerClass}>
              <SlidersHorizontal size={16} className="text-[#0075fc]" />
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none"
                style={styleSelect}
              >
                <option value="receita" style={styleOption}>Métrica: Receita</option>
                <option value="ticket" style={styleOption}>Métrica: Ticket Médio</option>
                <option value="pedidos" style={styleOption}>Métrica: Pedidos</option>
                <option value="tempo" style={styleOption}>Métrica: Tempo</option>
              </select>
            </div>

            {/* 2. Canal */}
            <div className={containerClass}>
              <Filter size={16} className="text-[#0075fc]" />
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none"
                style={styleSelect}
              >
                <option value="all" style={styleOption}>Todos os Canais</option>
                <option value="IFOOD" style={styleOption}>iFood</option>
                <option value="WHATSAPP" style={styleOption}>WhatsApp</option>
              </select>
            </div>

            {/* 3. Região */}
            <div className={containerClass}>
              <MapPin size={16} className="text-[#0075fc]" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none"
                style={styleSelect}
              >
                <option value="all" style={styleOption}>Todas as Regiões</option>
                <option value="Sul" style={styleOption}>Zona Sul</option>
                <option value="Norte" style={styleOption}>Zona Norte</option>
                <option value="Centro" style={styleOption}>Centro</option>
              </select>
            </div>

            {/* 4. Exportar */}
            <div className="flex items-center gap-2">
              {["csv", "xlsx", "pdf"].map((ext) => (
                <button
                  key={ext}
                  onClick={() => exportReport(ext, "30d", { channel: selectedChannel, region: selectedRegion })}
                  className={containerClass}
                  style={{ color: isDark ? "#ffffff" : "#000000" }}
                >
                  <Download size={16} /> {ext.toUpperCase()}
                </button>
              ))}
            </div>

        </div>
      </div>

      {/* === GRÁFICOS === */}
      <AdminKpiGrid resumo={resumo} isDark={isDark} />

      <div className="grid grid-cols-1 gap-8">
         <StoreChart data={lojasData} metric={metric} isDark={isDark} />
      </div>
      
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <CampaignsEngagement data={campanhasFiltradas} isDark={isDark} />
  <CampaignSimulator resumo={resumo} isDark={isDark} />
</div>

      <AdminSuggestions data={data} isDark={isDark} />
    </div>
  );
}