import { Lightbulb } from "lucide-react";

export default function CampaignSummary({
  insights,
  recomendacoes = [],
  isDark,
}) {
  if (!insights) return null;

  const melhor = insights.melhor_campanha || {};
  const pior = insights.pior_campanha || {};
  const taxaMedia = insights.taxa_conversao_media || 0;

  const bg = isDark ? "bg-[#1C1C1C]" : "bg-white";
  const border = isDark ? "border-[#222]" : "border-gray-200";
  const text = isDark ? "text-[#EAEAEA]" : "text-[#222]";

  return (
    <section className="flex flex-col gap-8">
      {/* 📊 INSIGHTS DE CAMPANHAS */}
      <div className={`${bg} p-6 rounded-2xl shadow-lg border ${border}`}>
        <h2 className="text-[#0075fc] font-semibold mb-3 text-lg">
          Resultados das Campanhas
        </h2>
        <div className={`space-y-3 text-sm ${text}`}>
          <p>
            <span className="text-[#0075fc] font-medium">Taxa média:</span>{" "}
            {String(taxaMedia).includes("%") ? taxaMedia : `${taxaMedia}%`}
          </p>
          <p>
            <span className="text-[#00BFA6] font-medium">Melhor campanha:</span>{" "}
            {melhor.nome || "—"} (
            {String(melhor.taxa_conversao).includes("%")
              ? melhor.taxa_conversao
              : `${melhor.taxa_conversao || 0}%`}
            )
          </p>
          <p>
            <span className="text-red-400 font-medium">Pior campanha:</span>{" "}
            {pior.nome || "—"} (
            {String(pior.taxa_conversao).includes("%")
              ? pior.taxa_conversao
              : `${pior.taxa_conversao || 0}%`}
            )
          </p>
        </div>
      </div>

      {/* 💡 RECOMENDAÇÕES */}
<div className={`${bg} p-6 rounded-2xl shadow-lg border ${border}`}>
  <h2 className="text-[#0075fc] font-semibold mb-3 text-lg flex items-center gap-2">
    <Lightbulb className="text-[#0075fc]" /> Recomendações
  </h2>
  <ul
    className={`space-y-2 text-sm ${
      isDark ? "text-[#EAEAEA]" : "text-[#222]"
    }`}
  >
    {recomendacoes.length > 0 ? (
      recomendacoes.map((rec, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#0075fc]">•</span>
          {/* CORREÇÃO: Acessa rec.mensagem e aplica a limpeza */}
          {rec.mensagem.replace("?", "").trim()} 
        </li>
      ))
    ) : (
      <li className="text-gray-400">Nenhuma recomendação disponível.</li>
    )}
  </ul>
</div>
    </section>
  );
}
