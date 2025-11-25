import { Wallet, Users, TrendingUp, Target, RefreshCcw } from "lucide-react";
import KpiCard from "./KpiCard"; // Mantém a dependência do KpiCard

export default function KpiGrid({ resumo, isDark }) {
  
  // 1. FUNÇÕES DE FORMATAÇÃO
  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value || 0);

  const formatNumber = (value) => (value || 0).toLocaleString('pt-BR');
  
  // 2. LÓGICA DE CORES DE STATUS
  const taxaInatividade = resumo.taxa_inatividade || 0;
  const clientesReativados = resumo.clientes_reativados || 0;

  // Cor Contextual para Risco (Taxa de Inatividade > 5% é ruim)
  const riskColor = taxaInatividade > 5 ? "text-red-500" : "text-green-500";
  
  // Cor Contextual para Sucesso (Reativação)
  const successColor = clientesReativados > 0 ? "text-green-500" : "text-gray-400";
  
  // Cor de Destaque Neutra
  const neutralColor = "text-indigo-400"; // Usando cor vibrante para futurismo
  const revenueColor = "text-teal-400";


  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
      
      {/* 1. TICKET MÉDIO */}
      <KpiCard 
        icon={<Wallet className={neutralColor} />} 
        label="Ticket Médio" 
        value={formatCurrency(resumo.ticket_medio || 0)} 
        isDark={isDark} 
      />
      
      {/* 2. RECEITA TOTAL */}
      <KpiCard 
        icon={<TrendingUp className={revenueColor} />} 
        label="Receita Total" 
        value={formatCurrency(resumo.receita_total || 0)} 
        isDark={isDark} 
      />
      
      {/* 3. CLIENTES ATIVOS */}
      <KpiCard 
        icon={<Users className={neutralColor} />} 
        label="Clientes Ativos" 
        value={formatNumber(resumo.clientes_ativos || 0)} 
        isDark={isDark} 
      />
      
      {/* 4. CLIENTES REATIVADOS (Indicador de sucesso) */}
      <KpiCard 
        icon={<RefreshCcw className={successColor} />} 
        label="Clientes Reativados" 
        value={formatNumber(clientesReativados)} 
        isDark={isDark} 
        glowEffect={successColor.replace('text-', 'shadow-')} // Adiciona glow verde se houver reativação
      />
      
      {/* 5. TAXA DE INATIVIDADE (Indicador de risco) */}
      <KpiCard 
        icon={<Target className={riskColor} />} 
        label="Taxa de Inatividade" 
        value={`${taxaInatividade.toFixed(1)}%`} 
        isDark={isDark} 
        glowEffect={riskColor.replace('text-', 'shadow-')} // Adiciona glow vermelho se for alto
      />
      
    </section>
  );
}