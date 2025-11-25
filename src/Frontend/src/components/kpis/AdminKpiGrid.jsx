import { Wallet, Users, Timer, Store } from "lucide-react";
import KpiCard from "./KpiCard";

export default function AdminKpiGrid({ resumo, isDark }) {
  
  // 1. FORMATADORES (Mantenha como está, eles estão ótimos)
  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatNumber = (value) => (value || 0).toLocaleString('pt-BR');
  
  const formatTime = (value) => `${Number(value || 0).toFixed(2)} min`;

  // 2. LÓGICA DE STATUS (Cores que reagem aos dados - Mantenha como está)
  
  // --- TEMPO DE PREPARO (Limite: > 40 min é ruim) ---
  const tempoAtual = resumo.tempo_medio_preparo || 0;
  const tempoStatusColor = tempoAtual > 40 
    ? "text-red-500" 
    : tempoAtual < 30 
    ? "text-green-500" 
    : "text-amber-500"; 

  // --- TICKET MÉDIO (Limite: > R$ 100 é bom) ---
  const ticketAtual = resumo.ticket_medio_geral || 0;
  const ticketStatusColor = ticketAtual > 100 
    ? "text-green-500"
    : ticketAtual < 60
    ? "text-red-500"
    : "text-blue-500"; 
    
  // Cor padrão para ícones neutros
  const neutralColor = "text-indigo-400"; // Mais futurista
  const orderColor = "text-purple-400";   // Mais futurista


  return (
    // Removi o padding do container para que os cards gerenciem seu próprio espaço
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <KpiCard
        icon={<Wallet className={ticketStatusColor} />} 
        label="Ticket Médio"
        value={formatCurrency(ticketAtual)} 
        isDark={isDark}
        // PROPRIEDADE EXTRA: Adiciona um efeito de glow azul no modo escuro
        glowEffect={isDark ? "shadow-blue-500/30" : ""} 
      />
      <KpiCard
        icon={<Timer className={tempoStatusColor} />} 
        label="Tempo Médio de Preparo"
        value={formatTime(tempoAtual)} 
        isDark={isDark}
        glowEffect={isDark ? "shadow-green-500/30" : ""}
      />
      <KpiCard
        icon={<Users className={neutralColor} />} 
        label="Total de Clientes"
        value={formatNumber(resumo.total_clientes || 0)} 
        isDark={isDark}
        glowEffect={isDark ? "shadow-indigo-500/30" : ""}
      />
      <KpiCard
        icon={<Store className={orderColor} />}
        label="Total de Pedidos"
        value={formatNumber(resumo.total_pedidos || 0)} 
        isDark={isDark}
        glowEffect={isDark ? "shadow-purple-500/30" : ""}
      />
    </div>
  );
}