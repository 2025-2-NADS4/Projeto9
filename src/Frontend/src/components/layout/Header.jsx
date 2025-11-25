import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { Sun, Moon, LogOut, Contrast, Menu, ArrowLeft, Calendar } from "lucide-react";

export default function Header({
  isDark,
  toggleTheme,
  selectedPeriod,
  setSelectedPeriod,
  restaurant,
  muted,
  border,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const isPerfilPage = location.pathname === "/perfil";

  // Valor padrão para selectedPeriod caso seja undefined
  const currentPeriod = selectedPeriod || "30d";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      className={`flex items-center justify-between px-8 py-4 border-b ${border} ${
        isDark ? "bg-[#0F0F0F]/80" : "bg-white/90"
      } backdrop-blur-md sticky top-0 z-50`}
    >
      {/* Menu à esquerda */}
      <div className="flex items-center gap-4">
        {/* Botão Voltar ao Dashboard (apenas no perfil) */}
        {isPerfilPage && (
          <button 
            className={`flex items-center gap-2 p-2 rounded-lg border ${border} hover:scale-105 transition-transform ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            onClick={() => navigate("/dashboard")}
            title="Voltar ao Dashboard"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
        )}
        
        {/* Menu Hamburguer (apenas se não for perfil) */}
        {!isPerfilPage && (
          <button 
            className={`p-2 rounded-lg border ${border} hover:scale-105 transition-transform ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            onClick={() => {/* Aqui vai a função para abrir o menu lateral */}}
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Logo e título CENTRALIZADOS */}
      <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
  <img src="/imagens/logo_visio.jpeg" alt="Visio" className="h-16" /> {/* h-16 */}
  <span
    className={`font-bold tracking-wide text-3xl ${ /* font-semibold → font-bold */
      isDark ? "text-[#00BFA6]" : "text-[#0075fc]"
    }`}
  >
    Visio | Insight Dashboard
  </span>
</div>

      {/* Elementos à direita */}
      <div className="flex items-center gap-4">
        {/* Botão de período com menu dropdown - CORRIGIDO */}
        <div className="hidden sm:block relative">
          <button
            onClick={() => setPeriodMenuOpen(!periodMenuOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isDark 
                ? "bg-[#1C1C1C] text-[#B0B0B0] hover:text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar size={16} />
            {currentPeriod.toUpperCase()}
          </button>

          {/* Menu dropdown de período */}
          {periodMenuOpen && (
            <div
              className={`absolute right-0 mt-2 w-20 rounded-xl shadow-lg border ${border} ${
                isDark ? "bg-[#1C1C1C]" : "bg-white"
              }`}
            >
              {["30d", "60d", "90d"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setPeriodMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 ${
                    currentPeriod === p
                      ? "bg-gradient-to-r from-[#4899f7] to-[#0075fc] text-white"
                      : isDark
                      ? "text-[#B0B0B0] hover:text-white hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${p === "30d" ? "rounded-t-xl" : ""} ${p === "90d" ? "rounded-b-xl" : ""}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modo claro/escuro */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full border ${border} hover:scale-105 transition-transform`}
        >
          {isDark ? <Contrast className="text-[#4899f7]" /> : <Contrast className="text-[#0075fc]" />}
        </button>

        {/* Avatar + menu */}
        <div className="relative">
          <img
            src="imagens/perfil.png"
            alt="User"
            className={`w-9 h-9 rounded-full border cursor-pointer ${
              isDark ? "border-[#4899f7]" : "border-[#0075fc]"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {menuOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border ${border} ${
                isDark ? "bg-[#1C1C1C]" : "bg-white"
              }`}
            >
              <button
                onClick={() => navigate("/perfil")}
                className="w-full text-left px-4 py-2 hover:bg-[#0075fc]/10 text-sm"
              >
                Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 text-sm flex items-center gap-2"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fechar menus ao clicar fora */}
      {(menuOpen || periodMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setMenuOpen(false);
            setPeriodMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}