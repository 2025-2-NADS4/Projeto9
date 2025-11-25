import React from 'react';

export default function KpiCard({ 
    icon, 
    label, 
    value, 
    isDark, 
    glowEffect,
    comparison // NOVO: Campo para receber a comparação (+2.5%)
}) {
  const cardBg = isDark 
    ? "bg-gray-800/30 backdrop-blur-md" // Fundo mais escuro, mais blur
    : "bg-white/40 backdrop-blur-sm";  // Fundo mais claro, menos blur

  const borderColor = isDark 
    ? "border-t border-l border-gray-700/50" 
    : "border-t border-l border-gray-300/50"; 

  const labelColor = isDark ? "text-gray-400" : "text-gray-600"; // Mais sutil
  const valueColor = isDark ? "text-white" : "text-gray-900"; 
  
  // Cor para o indicador de comparação
  const comparisonColor = comparison && comparison.includes('-') 
    ? "text-red-400" 
    : "text-green-400";

  return (
    <div className={`
      ${cardBg} 
      ${borderColor}
      rounded-2xl 
      p-5 
      flex 
      flex-col 
      justify-between 
      transition-all 
      duration-300
      hover:scale-[1.02] 
      hover:shadow-xl 
      ${glowEffect ? `dark:shadow-md dark:hover:shadow-lg dark:shadow-[${glowEffect}]` : ''} 
    `}>
      
      {/* Linha Superior: Ícone e Label */}
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs uppercase font-medium ${labelColor}`}>{label}</p>
        <div className="text-xl">
          {icon} {/* O ícone já vem com a cor dinâmica de status */}
        </div>
      </div>
      
      {/* Linha Inferior: Valor e Comparação */}
      <div className="flex flex-col items-start">
        <p className={`text-3xl tracking-tight font-extrabold ${valueColor}`}>
            {value}
        </p>

        {/* INDICADOR DE COMPARAÇÃO (Adicionado) */}
        {comparison && (
          <p className={`text-xs font-semibold mt-1 ${comparisonColor}`}>
            {comparison} vs. 30 Dias
          </p>
        )}
      </div>
    </div>
  );
}