export default function ChartCard({ title, children, isDark }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-md border transition-colors duration-500 ${
        isDark ? "bg-[#1C1C1C] border-[#222]" : "bg-white border-gray-200"
      }`}
    >
      <h2 className="font-semibold mb-4 text-lg bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] bg-clip-text text-transparent">
        {title}
      </h2>
      {children}
    </div>
  );
}
