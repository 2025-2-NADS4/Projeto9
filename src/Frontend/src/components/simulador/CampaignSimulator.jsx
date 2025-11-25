import { Play } from "lucide-react";
import { useMemo, useState } from "react";

export default function CampaignSimulator({ resumo, isDark }) {
  const [sim, setSim] = useState({ investimento: 1000, taxa: 2, publico: 1000 });

  const simResult = useMemo(() => {
    const conv = Math.max(0, (sim.taxa || 0) / 100);
    const pedidos = Math.round(sim.publico * conv);
    const ticket = Number(resumo.ticket_medio_geral || 0);
    const receita = (pedidos * ticket).toFixed(2);
    const roi = ticket
      ? (((receita - sim.investimento) / sim.investimento) * 100).toFixed(1)
      : 0;
    return { pedidos, receita, roi };
  }, [sim, resumo.ticket_medio_geral]);

  return (
    <div
  className={`rounded-2xl border ${
    isDark ? "border-white/10 bg-black/20" : "border-gray-200 bg-white"
  } p-6 backdrop-blur-sm transition`}
>
  <h3 className="text-xl font-semibold mb-5 text-[#0075fc] flex items-center gap-2">
    <Play size={18} className="text-[#0075fc]" /> Simule aqui sua campanha
  </h3>

  {/* Inputs */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
    <InputField
      label="Investimento (R$)"
      value={sim.investimento}
      onChange={(v) => setSim((s) => ({ ...s, investimento: +v }))}
    />
    <InputField
      label="Taxa Conversão (%)"
      value={sim.taxa}
      onChange={(v) => setSim((s) => ({ ...s, taxa: +v }))}
    />
    <InputField
      label="Público impactado"
      value={sim.publico}
      onChange={(v) => setSim((s) => ({ ...s, publico: +v }))}
    />
  </div>

  {/* Resultados */}
  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
    <ResultCard label="Pedidos previstos" value={simResult.pedidos} />

    <ResultCard
      label="Receita prevista"
      value={`R$ ${simResult.receita}`}
    />

    <ResultCard
      label="ROI estimado"
      value={`${simResult.roi}%`}
      full
      highlight // deixa mais bonito
    />
  </div>
</div>

  );
}

function InputField({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 opacity-80">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}

function ResultCard({ label, value, full }) {
  return (
    <div
      className={`p-3 rounded-lg bg-black/5 dark:bg-white/5 ${
        full ? "col-span-2" : ""
      }`}
    >
      {label}: <b>{value}</b>
    </div>
  );
}
