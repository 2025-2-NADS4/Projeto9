import TableRow from "./TableRow";

export default function ComparisonTable({ resumo, isDark }) {
  return (
    <section className={`p-6 rounded-2xl shadow-lg border ${isDark ? "bg-[#1C1C1C] border-[#222]" : "bg-white border-gray-200"} mb-10`}>
      <h2 className="font-semibold mb-4 text-lg text-center bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] bg-clip-text text-transparent">
        Impacto da Plataforma Cannoli no Restaurante
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={`${isDark ? "bg-[#0F0F0F]" : "bg-gray-50"} text-transparent bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] bg-clip-text`}>
              <th className="p-3 text-left">Indicador</th>
              <th className="p-3 text-center">Antes da Cannoli</th>
              <th className="p-3 text-center">Agora com Cannoli</th>
              <th className="p-3 text-center">Variação</th>
            </tr>
          </thead>
          <tbody>
            <TableRow label="Ticket médio" before="R$ 62,40" now={`R$ ${resumo.ticket_medio}`} variation={(((resumo.ticket_medio - 62.4) / 62.4) * 100).toFixed(1)} />
            <TableRow label="Clientes ativos" before="73" now={resumo.clientes_ativos} variation={(((resumo.clientes_ativos - 73) / 73) * 100).toFixed(1)} />
            <TableRow label="Taxa de inatividade" before="45%" now={`${resumo.taxa_inatividade}%`} decrease={(45 - resumo.taxa_inatividade).toFixed(1)} />
            <tr className={`border-t ${isDark ? "border-[#222]" : "border-gray-200"}`}>
              <td className="p-3">Clientes reativados</td>
              <td className="p-3 text-center text-gray-400">—</td>
              <td className="p-3 text-center">{resumo.clientes_reativados || 0}</td>
              <td className="p-3 text-center text-green-500 font-medium">▲ Novo público fidelizado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
