import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CampaignsChartAdmin({ data, isDark }) {
  const axisColor = isDark ? "#E0E0E0" : "#333";
  const tooltipBg = isDark ? "#1C1C1C" : "#FFFFFF";
  const tooltipColor = isDark ? "#FFF" : "#000";

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4 text-[#00BFA6]">💬 Campanhas com Maior Engajamento</h3>
      <div className={`rounded-2xl border ${isDark ? "border-[#222]" : "border-gray-200"} p-4 shadow-lg`}>
        <ResponsiveContainer width="100%" height={480}>
          <BarChart layout="vertical" data={data} margin={{ top: 16, right: 30, left: 110, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#ddd"} />
            <XAxis type="number" stroke={axisColor} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="nome" type="category" width={160} tick={{ fill: axisColor }} />
            <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: "10px", border: "1px solid #00BFA6", color: tooltipColor }} formatter={(v) => `${v}%`} />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0077FF" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <Bar dataKey="taxa_resposta_%" fill="url(#blueGradient)" radius={[0, 10, 10, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
