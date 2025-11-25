import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";

export default function RevenueChart({ data, isDark }) {
  const chartData =
    data?.map((d) => ({
      name: new Date(d.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: Number(d.receita_prevista) || 0,
    })) || [];

  // 🎨 Tema dinâmico
  const axisColor = isDark ? "#E0E0E0" : "#333";
  const gridColor = isDark ? "#2A2A2A" : "#E5E5E5";
  const tooltipBg = isDark ? "#1C1C1C" : "#FFFFFF";
  const tooltipBorder = isDark ? "#6bb0ff" : "#0075fc";
  const tooltipText = isDark ? "#EAEAEA" : "#222";
  const bgColor = isDark ? "#0F0F0F" : "#F8F8F8";
  const lineColor = "#0075fc";

  return (
    <ChartCard title="Previsão de Receita (7 dias)" isDark={isDark}>
      <div
        className="rounded-2xl p-4 transition-colors"
        style={{ backgroundColor: bgColor }}
      >
        <ResponsiveContainer width="100%" height={450}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          >
            {/* Grid e eixos */}
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke={axisColor}
              tick={{ fill: axisColor, dy: 10 }}
              tickLine={{ stroke: axisColor }}
              axisLine={{ stroke: axisColor }}
            />
            <YAxis
              stroke={axisColor}
              tick={{ fill: axisColor }} // afasta os rótulos da linha
              tickLine={{ stroke: axisColor }}
              axisLine={{ stroke: axisColor }}
              domain={["dataMin - 20", "dataMax + 20"]}
              // aumenta contraste vertical
            />

            {/* Gradiente para a área */}
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isDark ? "#6bb0ff" : "#0075fc"}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={isDark ? "#6bb0ff" : "#0075fc"}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            {/* Área e linha */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#colorReceita)"
              tooltipType="none"
            />

            <Line
              type="monotone"
              dataKey="value"
              name="Receita prevista"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ stroke: lineColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                dataKey="value"
                position="top"
                style={{
                  fill: isDark ? "#6bb0ff" : "#0075fc",
                  fontSize: 12,
                  fontWeight: "600",
                }}
                formatter={(v) =>
                  `R$ ${Number(v).toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                  })}`
                }
              />
            </Line>

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                color: tooltipText,
              }}
              itemStyle={{ color: tooltipText }}
              labelStyle={{ color: tooltipText }}
              formatter={(v) =>
                `R$ ${Number(v).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
