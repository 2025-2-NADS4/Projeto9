import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import ChartCard from "./ChartCard";

export default function CampaignsChart({ data, isDark }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  
  const axisColor = isDark ? "#E0E0E0" : "#333";
  const tooltipBg = isDark ? "#1C1C1C" : "#FFFFFF";
  const tooltipBorder = isDark ? "#4899f7" : "#0075fc";
  const tooltipText = isDark ? "#EAEAEA" : "#222";
  const bgColor = isDark ? "#0F0F0F" : "#F8F8F8";

  return (
    <ChartCard title="Campanha Realizadas" isDark={isDark}>
      <div
        className="rounded-2xl p-8 transition-colors" // Aumentei ainda mais o padding
        style={{ backgroundColor: bgColor }}
      >
        <ResponsiveContainer width="100%" height={450}> {/* Altura máxima */}
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={160} // Raio bem maior
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                color: tooltipText,
                borderRadius: '8px',
                fontSize: '14px'
              }}
              itemStyle={{ color: tooltipText }}
              labelStyle={{ color: tooltipText }}
              formatter={(value) => [value, "Quantidade"]}
            />
            <Legend 
              wrapperStyle={{
                color: axisColor,
                fontSize: '14px',
                paddingTop: '25px'
              }}
              iconSize={16} // Ícones maiores
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}