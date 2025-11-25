import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts";

export default function StoreChart({ data, metric, isDark }) {
  // Cores do gráfico
  const axisColor = isDark ? "#E0E0E0" : "#333";
  const tooltipBg = isDark ? "#1C1C1C" : "#FFFFFF";
  const tooltipColor = isDark ? "#FFF" : "#000";

  // Definimos a chave de dados que a barra e a label usarão
  const activeDataKey = 
    metric === "ticket"
      ? "ticket_medio"
      : metric === "tempo"
      ? "tempo_medio"
      : metric === "pedidos"
      ? "pedidos"
      : "receita"; // Receita é o padrão

  // Função para formatar a label (o valor em cima da barra e o tooltip)
  const formatLabel = (value) => {
    const numValue = Number(value);
    
    if (activeDataKey === "tempo_medio") return `${numValue.toFixed(2)} min`;
    if (activeDataKey === "pedidos") return numValue.toFixed(0);
    
    // Formatação BRL (Moeda)
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numValue);
  };
  
  // Condição para que o gráfico não quebre se não houver dados (ex: depois de um filtro)
  if (!data || data.length === 0) {
    return (
        <section>
            <h3 className="text-xl font-semibold mb-4 text-[#0075fc]">🏆 Lojas com Maior Receita</h3>
            <div className={`rounded-2xl border ${isDark ? "border-[#222]" : "border-gray-200"} p-10 text-center text-gray-500`} style={{ height: 460 }}>
                <p>Nenhuma loja encontrada para este filtro.</p>
            </div>
        </section>
    );
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4 text-[#0075fc]"> Lojas que atingiram maior numero de receita</h3>
      <div className={`rounded-2xl border ${isDark ? "border-[#222]" : "border-gray-200"} p-4 shadow-lg`}>
        <ResponsiveContainer width="100%" height={460}>
          {/* AUMENTAMOS A MARGEM INFERIOR PARA 120 para evitar sobreposição */}
          <BarChart data={data} margin={{ top: 48, right: 30, left: 10, bottom: 120 }}> 
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#ddd"} />
            
            {/* CORREÇÃO 1: Rotação do rótulo para evitar sobreposição */}
            {/* dataKey=store.name está correto (minúsculo) */}
            <XAxis 
                dataKey="store.name" 
                stroke={axisColor} 
                angle={-45} // <--- MAIOR ROTAÇÃO APLICADA AQUI
                textAnchor="end" 
                interval={0} 
                height={125} // <--- AUMENTO DE ALTURA PARA ACOMODAR O TEXTO
                tick={{ fontSize: 12 }} 
            />
            
            <YAxis stroke={axisColor} formatter={formatLabel} />
            
            {/* Tooltip também usa o formatador unificado */}
            <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderRadius: "10px", border: "1px solid #555", color: tooltipColor }} 
                formatter={(v) => formatLabel(v)} 
                labelFormatter={(name) => name}
            />
            
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6bb0ff" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0075fc" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            
            <Bar
              dataKey={activeDataKey} // Usa a chave dinâmica
              fill="url(#goldGradient)"
              radius={[8, 8, 0, 0]}
              barSize={40}
            >
              {/* CORREÇÃO 2: LabelList usa a mesma chave dinâmica e formatação de moeda */}
              <LabelList 
                dataKey={activeDataKey} 
                position="top" 
                dy={-6} 
                fill={axisColor}
                formatter={formatLabel}
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}